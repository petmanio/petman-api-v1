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
	  return Adopt.getAdoptById(req.pmAdopt.id)
      .then(adopt => {
        res.json(adopt)
      })
      .catch(next)
  },

  getCommentList(req, res, next) {
    AdoptComment.getList(req.pmAdopt.id)
      .then(comments => {
        res.json(comments)
      })
      .catch(next);
  },

  createComment(req, res, next) {
	  let comment;
    AdoptComment.create({
      user: req.pmUser.id,
      adopt: req.pmAdopt.id,
      comment: req.body.comment
    })
      .then(comment => {
        return User.findOne({id: req.pmUser.id})
          .populate('userData')
          .then(user => {
            comment = comment.toJSON();
            comment.user = user;
            return comment;
          });
      })
      .then(data => {
        comment = data;
        // TODO: improve, only unique userIds
        return AdoptComment.find({ select: ['user'], adopt: req.pmAdopt.id });
      })
      .then(userComments => {
        const userIds = _(userComments).map('user').uniqBy().value();
        return User.find({select: ['id', 'socketId'], id: userIds});
      })
      .then(userToUpdate => {
        const userForSendComment = _(userToUpdate).map('socketId').value();

        // TODO: only send new message to receiver using socket
        sails.sockets.broadcast(userForSendComment.filter(Boolean), 'adoptComment', comment);
        res.ok();
      })
      .catch(next)
  }

};

