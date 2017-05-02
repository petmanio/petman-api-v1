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
	  let newApplication;
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
      .then(userForNotify => {
        sails.sockets.broadcast([userForNotify.socketId].filter(Boolean),
          'roomApplicationCreate', newApplication);
        res.json(newApplication);
      })
      .catch(next);
  },

  updateApplication(req, res, next) {
	  // TODO: add validations
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
      .then(application => {
        return User.findOne({
          id: req.pmRoomApplication.provider === req.pmUser.id ? req.pmRoomApplication.consumer : req.pmRoomApplication.provider
        });
      })
      .then(userForNotify => {
        sails.sockets.broadcast([userForNotify.socketId].filter(Boolean),
          'roomApplicationUpdate', req.pmRoomApplication);
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

    RoomApplicationMessage.create({
      from: req.pmUser.id,
      to: req.pmRoomApplication.consumer === req.pmUser.id ?
        req.pmRoomApplication.provider : req.pmRoomApplication.consumer,
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
      .then(message => {
        sails.sockets.broadcast([message.from.socketId, message.to.socketId].filter(Boolean),
          'roomApplicationMessage', message);
        res.ok();
      })
      .catch(next)

  }
};

