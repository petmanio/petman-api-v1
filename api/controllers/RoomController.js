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
	  return Room.getRoomById(req.param('roomId'), req.pmUser.id)
      .then(room => {
        room.isOwner = room.user.id === req.pmUser.id;
        res.json(room)
      })
      .catch(next)
  },

  apply(req, res, next) {
	  RoomApplication.findOrCreate({
      consumer: req.pmUser.id,
      provider: req.pmRoom.user,
      room: req.pmRoom.id,
      status: 'WAITING'
    })
      .then(application => res.created())
      .catch(next);
  },

  updateApplication(req, res, next) {
	  // TODO: add validations
    req.pmRoomApplication.status = req.body.status;
    req.pmRoomApplication.save()
      .then(application => res.json(req.pmRoomApplication))
      .catch(next);
  },

  getApplicationMessageList(req, res, next) {
	  RoomApplicationMessage.getList(req.pmRoomApplication.id)
      .then(messages=> {
        messages.list = messages.list.map(message => {
          message.isOwner = req.pmUser.id === message.from.id;
          return message;
        });
        res.json(messages)
      })
      .catch(next);
  },

  applicationMessageJoin(req, res, next) {
    if (!req.isSocket) {
      return res.badRequest();
    }

    const roomName = `room_application_message_${req.pmRoomApplication.room}_${req.pmRoomApplication.id}`;
    sails.sockets.join(req, roomName, (err) => {
      if (err) {
        return next(err);
      }

      return res.json({
        message: `Subscribed to a message room called ${roomName}`
      });
    });
  },

  createApplicationMessage(req, res, next) {
	  // TODO: application status validation
    if (!req.isSocket) {
      return res.badRequest();
    }
    const roomName = `room_application_message_${req.pmRoomApplication.room}_${req.pmRoomApplication.id}`;

    RoomApplicationMessage.create({
      from: req.pmUser.id,
      to: req.pmRoomApplication.consumer === req.pmUser.id ?
        req.pmRoomApplication.provider : req.pmRoomApplication.consumer,
      message: req.body.message,
      application: req.pmRoomApplication.id
    })
      .then(message => {
        message = message.toJSON();
        message.isOwner = req.pmUser.id === message.from;
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
      .then(message => {
        sails.sockets.broadcast(roomName, 'roomApplicationMessage', message);
      })
      .catch(next)

  }
};

