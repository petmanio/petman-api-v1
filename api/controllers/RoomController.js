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
	  res.ok();
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
          user: req.pmUser,
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
      .then(room => res.ok(room.toJSON()))
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
        if (req.pmUser) {
          room.isOwner = room.user.id === req.pmUser.id;
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
    RoomApplication.getApplicationList(req.pmRoom.id, req.pmUser.id)
      .then(applications => res.ok(applications))
      .catch(next)
  },

  apply(req, res, next) {
	  let newApplication;
	  let userForNotify;
	  RoomApplication.findOrCreate({
      consumer: req.pmUser.id,
      provider: req.pmRoom.user,
      room: req.pmRoom.id,
      status: 'WAITING'
    })
      .then(application => {
        newApplication = application;
        return User.findOne({id: application.consumer})
          .populate('userData');
      })
      .then(consumer => {
        newApplication = newApplication.toJSON();
        newApplication.consumer = consumer;
        return User.findOne({
          id: newApplication.provider
        });
      })
      .then(data => {
        userForNotify = data;
        return Notification.create({
          from: req.pmUser.id,
          to: userForNotify.id,
          roomApplicationCreate: {
            room: newApplication.room,
            application: newApplication.id
          }
        })
          .then(notification => {
            return Notification.findOne({id: notification.id})
              .populate('roomApplicationCreate')
              .populate('roomApplicationStatusUpdate')
              .populate('roomApplicationMessageCreate');
          });
      })
      .then((notification) => {
	      return User.findOne({id: notification.from})
          .populate('userData')
          .then(user => {
            notification = notification.toJSON();
            notification.from = user;
            return notification;
          })
      })
      .then(notification => {
        sails.sockets.broadcast(userForNotify.socketId, 'notificationNew', notification);
        sails.sockets.broadcast(userForNotify.socketId, 'roomApplicationCreate', newApplication);
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

    if (req.pmRoomApplication.provider === req.pmUser.id) {
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
          from: req.pmUser.id,
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

  getApplicationMessageList(req, res, next) {
	  RoomApplicationMessage.getList(req.pmRoomApplication.id)
      .then(messages=> {
        res.json(messages)
      })
      .catch(next);
  },

  createApplicationMessage(req, res, next) {
	  // TODO: application status validation
    let message;
    RoomApplicationMessage.create({
      from: req.pmUser.id,
      to: req.pmRoomApplication.consumer === req.pmUser.id ?
        req.pmRoomApplication.provider : req.pmRoomApplication.consumer,
      room: req.pmRoomApplication.room,
      message: req.body.message,
      application: req.pmRoomApplication.id
    })
      .then(message => {
        message = message.toJSON();
        const deferred = Q.defer();
        User.findOne({id: message.to})
          .populate('userData')
          .then(user => {
            message.to = user;
            deferred.resolve(message);
          })
          .catch(deferred.reject);

        return deferred.promise;
      })
      .then(message => {
        const deferred = Q.defer();
        User.findOne({id: message.from})
          .populate('userData')
          .then(user => {
            message.from = user;
            deferred.resolve(message);
          })
          .catch(deferred.reject);

        return deferred.promise;
      })
      .then(data => {
        message = data;
        return Notification.create({
          from: req.pmUser.id,
          to: message.to.id,
          roomApplicationMessageCreate: {
            room: req.pmRoomApplication.room,
            application: req.pmRoomApplication.id,
            message: message.id,
          }
        })
          .then(notification => {
            return Notification.findOne({id: notification.id})
              .populate('roomApplicationMessageCreate');
          });
      })
      .then(notification => {
        notification = notification.toJSON();
        notification.from = message.from;

        // TODO: only send new message to receiver using socket
        sails.sockets.broadcast([message.from.socketId, message.to.socketId].filter(Boolean),
          'roomApplicationMessage', message);

        sails.sockets.broadcast(message.to.socketId, 'notificationNew', notification);
        res.ok();
      })
      .catch(next)
  }
};

