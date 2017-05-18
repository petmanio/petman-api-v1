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

module.exports = {
	list(req, res, next) {
	  Room.getList(req.query.skip, req.query.limit)
      .then(room => res.ok(room))
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
          user: req.pmUser,
          images: images.map(image => {
            return { src: image.fd.replace(config.uploadDir, '') }
          })
        });
      })
      .then(room => res.ok(room.toJSON()))
      .catch(err => {
        uploadedImages.forEach(image => fs.unlink(image.fd));
        next(err)
      })
  },

  getById(req, res, next) {
	  return Room.getRoomById(req.pmRoom.id, req.pmUser && req.pmUser.id)
      .then(room => {
        if (req.pmUser) {
          room.isOwner = room.user.id === req.pmUser.id;
        } else {
          room.isOwner = false;
        }
        res.json(room)
      })
      .catch(next)
  },

  apply(req, res, next) {
	  let newApplication;
	  let userForNotify;
	  RoomApplication.findOrCreate({
      consumer: req.pmUser.id,
      provider: req.pmRoom.user,
      room: req.pmRoom.id,
      status: 'IN_PROGRESS'
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

  updateApplication(req, res, next) {
	  // TODO: add validations
    let userForNotify;
    let notification;
    let prevStatus = req.pmRoomApplication.status;
    if (req.pmRoomApplication.status === 'FINISHED' &&
      !req.pmRoomApplication.review && req.pmRoomApplication.provider === req.pmUser.id) {
      return res.json(req.pmRoomApplication);
    }

    req.pmRoomApplication.status = req.body.status;
    if (req.pmRoomApplication.status === 'FINISHED') {
      req.pmRoomApplication.finishedAt = new Date();
      req.pmRoomApplication.review = req.body.review;
      req.pmRoomApplication.rating = req.body.rating;
    }
    req.pmRoomApplication.save()
      .then(() => {
        return User.findOne({
          id: req.pmRoomApplication.provider === req.pmUser.id ? req.pmRoomApplication.consumer : req.pmRoomApplication.provider
        });
      })
      .then(data => {
        userForNotify = data;
        return Notification.create({
          from: req.pmUser.id,
          to: userForNotify.id,
          roomApplicationStatusUpdate: {
            room: req.pmRoomApplication.room,
            application: req.pmRoomApplication.id,
            prevStatus: prevStatus,
            currentStatus: req.pmRoomApplication.status
          }
        })
          .then(notification => {
            return Notification.findOne({id: notification.id})
              .populate('roomApplicationCreate')
              .populate('roomApplicationStatusUpdate')
              .populate('roomApplicationMessageCreate');
          });
      })
      .then(data => {
        notification = data;
        return User.findOne({id: notification.from}).populate('userData');
      })
      .then(user => {
        notification = notification.toJSON();
        user = user.toJSON();
        notification.from = user;
        sails.sockets.broadcast(userForNotify.socketId, 'roomApplicationUpdate', req.pmRoomApplication);
        sails.sockets.broadcast(userForNotify.socketId, 'notificationNew', notification);
        res.json(req.pmRoomApplication);
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

