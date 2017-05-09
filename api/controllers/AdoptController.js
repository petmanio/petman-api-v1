/**
 * AdoptController
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
	  Adopt.getList(req.query.skip, req.query.limit)
      .then(adopt => res.ok(adopt))
      .catch(next);
  },

  create(req, res, next) {
    let uploadedImages = [];
    UtilService.uploadFile(req, 'images', path.join(config.uploadDir, 'images/adopt'))
      .then(images => {
        uploadedImages = images;
        return Adopt.create({
          description: req.body.description,
          contactPhone: req.body.contactPhone,
          user: req.pmUser,
          images: images.map(image => {
            return { src: image.fd.replace(config.uploadDir, '') }
          })
        });
      })
      .then(adopt => res.ok(adopt.toJSON()))
      .catch(err => {
        uploadedImages.forEach(image => fs.unlink(image.fd));
        next(err)
      })
  },

  getById(req, res, next) {
	  return Adopt.getAdoptById(req.param('adoptId'), req.pmUser.id)
      .then(adopt => {
        adopt.isOwner = adopt.user.id === req.pmUser.id;
        res.json(adopt)
      })
      .catch(next)
  }
};

