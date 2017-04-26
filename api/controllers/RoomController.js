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
      room: req.pmRoom.id
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
};

