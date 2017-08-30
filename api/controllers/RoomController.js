/**
 * RoomController
 *
 * @description :: Server-side logic for managing Shops
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const config = sails.config;
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const Q = require('q');
const nestedPop = require('nested-pop');

module.exports = {
	list(req, res, next) {
    Room.getList(req.query.skip, req.query.limit)
      .then(rooms => {
        if (req.pmSelectedUser) {
          rooms.list = rooms.list.map(room => {
            room.isOwner = room.user.id === req.pmSelectedUser.id;
            return room;
          });
        }
        res.ok(rooms);
      })
      .catch(next);
  },

  create(req, res, next) {
    let uploadedImages = [];
    UtilService.uploadFile(req, 'images', path.join(config.uploadDir, 'images/room'))
      .then(images => {
        uploadedImages = images;
        return Room.create({
          name: req.body.name,
          description: req.body.description,
          cost: req.body.cost,
          limit: req.body.limit,
          user: req.pmSelectedUser,
          images: images.map(image => {
            return { src: image.fd.replace(config.uploadDir, '') }
          })
        });
      })
      .then(room => {
        return Room.findOne({id: room.id})
          .populate('images')
          .populate('user')
          .then(room => nestedPop(room, { user: ['userData'] }))
      })
      .then(room => {
        room.isOwner = true;
        res.ok(room);
      })
      .catch(err => {
        uploadedImages.forEach(image => fs.unlink(image.fd));
        next(err)
      })
  },

  getById(req, res, next) {
	  let averageRaging;
	  return RoomApplication.findOne({room: req.pmRoom.id})
      .average('rating')
      .then(result => {
        averageRaging = result.rating;
        return Room.findOne({id: req.pmRoom.id})
          .populate('images')
          .populate('user')
      })
      .then(room => nestedPop(room, { user: ['userData'] }))
      .then(room => {
        room.averageRating = averageRaging;
        if (req.pmSelectedUser) {
          room.isOwner = room.user.id === req.pmSelectedUser.id;
        }
        res.ok(room.toJSON())
      })
      .catch(next);
  },

  deleteById(req, res, next) {
    Room.deleteById(req.pmRoom.id)
      .then(res.ok())
      .catch(next)
  },

  getApplicationList(req, res, next) {
    RoomApplication.getApplicationList(req.pmRoom.id, req.pmSelectedUser.id)
      .then(applications => res.ok(applications))
      .catch(next)
  },

  apply(req, res, next) {
	  let newApplication;
	  let userToNotify;
	  RoomApplication.findOrCreate({
      consumer: req.pmSelectedUser.id,
      provider: req.pmRoom.user,
      room: req.pmRoom.id,
      status: 'WAITING'
    })
      .then(application => {
        return RoomApplication.findOne({id: application.id})
          .populate('consumer')
          .populate('provider')
          .sort({createdAt: 'desc'})
          .then(reviews => nestedPop(reviews, {
            consumer: {as: 'user', populate: ['userData']},
            provider: {as: 'user', populate: ['userData']},
          }));
      })
      .then(application => {
        newApplication = application;
        return User.findOne(application.provider.id);
      })
      .then(data => {
        userToNotify = data;
        return Notification.create({
          from: req.pmSelectedUser.id,
          to: userToNotify.id,
          roomApplicationCreate: {
            room: newApplication.room,
            application: newApplication.id
          }
        })
          .then(notification => {
            return Notification.findOne({id: notification.id})
              .populate('roomApplicationCreate')
              .populate('from')
              .then(notification => nestedPop(notification, {
                from: {as: 'user', populate: ['userData']}
              }));
          });
      })
      .then((notification) => {
        sails.sockets.broadcast(userToNotify.socketId, 'notificationNew', notification);
        sails.sockets.broadcast(userToNotify.socketId, 'roomApplicationCreate', newApplication);
        res.json(newApplication);
      })
      .catch(next);
  },

  updateApplicationStatus(req, res, next) {
    // TODO: add validations messaged
    let statusIsRight;
    let userToNotifyId;
    let userToNotify;
    let prevStatus = req.pmRoomApplication.status;
    if (req.body.status === req.pmRoomApplication.status) {
      return res.ok();
    }

    if (req.pmRoomApplication.provider === req.pmSelectedUser.id) {
      const availableStatuses = ['CANCELED_BY_PROVIDER', 'FINISHED', 'IN_PROGRESS'];
      statusIsRight = availableStatuses.indexOf(req.body.status) !== -1;
      userToNotifyId = req.pmRoomApplication.consumer;
    } else {
      const availableStatuses = ['CANCELED_BY_CONSUMER', 'FINISHED'];
      statusIsRight = availableStatuses.indexOf(req.body.status) !== -1;
      userToNotifyId = req.pmRoomApplication.provider;
    }

    if (!statusIsRight) {
      return res.badRequest();
    }

    req.pmRoomApplication.status = req.body.status;
    req.pmRoomApplication.save()
      .then(() => {
        return User.findOne({
          id: userToNotifyId
        });
      })
      .then(user => {
        userToNotify = user;
        return Notification.create({
          from: req.pmSelectedUser.id,
          to: userToNotify.id,
          roomApplicationStatusUpdate: {
            room: req.pmRoomApplication.room,
            application: req.pmRoomApplication.id,
            prevStatus: prevStatus,
            currentStatus: req.pmRoomApplication.status
          }
        });
      })
      .then(notification => {
        return Notification.findOne({id: notification.id})
          .populate('roomApplicationStatusUpdate')
          .populate('from')
          .then(notification => nestedPop(notification, {
            from: {as: 'user', populate: ['userData']}
          }));
      })
      .then(notification => {
        sails.sockets.broadcast(userToNotify.socketId, 'notificationNew', notification);
        sails.sockets.broadcast(userToNotify.socketId, 'roomApplicationStatusUpdate', {
          roomId: req.pmRoomApplication.room,
          applicationId: req.pmRoomApplication.id,
          status: req.pmRoomApplication.status
        });
        res.ok();
      })
      .catch(next);
  },

  rateApplication(req, res, next) {
    // TODO: add validations messaged
    let userToNotify;

    // TODO: use policy
    if (req.pmRoomApplication.consumer !== req.pmSelectedUser.id) {
      return res.badRequest();
    }

    if (req.body.status === req.pmRoomApplication.status) {
      return res.ok();
    }

    req.pmRoomApplication.rating = req.body.rating;
    req.pmRoomApplication.review = req.body.review;
    req.pmRoomApplication.save()
      .then(() => {
        return User.findOne({
          id: req.pmRoomApplication.provider
        });
      })
      .then(user => {
        userToNotify = user;
        return Notification.create({
          from: req.pmSelectedUser.id,
          to: userToNotify.id,
          roomApplicationRate: {
            room: req.pmRoomApplication.room,
            application: req.pmRoomApplication.id,
            rating: req.pmRoomApplication.rating,
            review: req.pmRoomApplication.review
          }
        });
      })
      .then(notification => {
        return Notification.findOne({id: notification.id})
          .populate('roomApplicationRate')
          .populate('from')
          .then(notification => nestedPop(notification, {
            from: {as: 'user', populate: ['userData']}
          }));
      })
      .then(notification => {
        sails.sockets.broadcast(userToNotify.socketId, 'notificationNew', notification);
        sails.sockets.broadcast(userToNotify.socketId, 'roomApplicationRate', {
          roomId: req.pmRoomApplication.room,
          applicationId: req.pmRoomApplication.id,
          rating: req.pmRoomApplication.rating,
          review: req.pmRoomApplication.review
        });
        res.ok();
      })
      .catch(next);
  }
};

