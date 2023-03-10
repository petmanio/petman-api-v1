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
const nestedPop = require('nested-pop');

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
          images: images.map(image => {
            return { src: image.fd.replace(config.uploadDir, '') }
          }),
          user: req.pmSelectedUser
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
        if (req.pmSelectedUser) {
          adopt.isOwner = adopt.user.id === req.pmSelectedUser.id;
        } else {
          adopt.isOwner = false;
        }
        res.json(adopt)
      })
      .catch(next)
  },

  deleteById(req, res, next) {
    Adopt.deleteById(req.pmAdopt.id)
      .then(res.ok())
      .catch(next)
  },

  getCommentList(req, res, next) {
    AdoptComment.getList(req.pmAdopt.id, req.query.skip, req.query.limit)
      .then(comments => {
        res.json(comments)
      })
      .catch(next);
  },

  joinComment(req, res, next) {
    if (!req.isSocket) {
      return res.badRequest();
    }

    const roomName = `adopt_comment_${req.pmAdopt.id}`;
    sails.sockets.join(req, roomName)
  },

  createComment(req, res, next) {
	  let comment;
    AdoptComment.create({
      user: req.pmSelectedUser.id,
      adopt: req.pmAdopt.id,
      comment: req.body.comment
    })
      .then(comment => {
        return User.findOne({id: req.pmSelectedUser.id})
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
        let userIds = _(userComments).map('user').concat(req.pmAdopt.user).uniqBy().value();
        userIds = userIds.filter(userId => userId !== req.pmSelectedUser.id);

        // TODO: only send new message to receiver using socket
        const roomName = `adopt_comment_${req.pmAdopt.id}`;
        sails.sockets.broadcast(roomName, 'adoptComment', comment);

        return Q.all(userIds.map(user => {
          return Notification.create({
            from: req.pmSelectedUser.id,
            to: user,
            adoptCommentCreate: {
              adopt: req.pmAdopt.id,
              comment: comment.id,
            }
          })
            .then(notification => {
              return Notification.findOne({id: notification.id})
                .populate('adoptCommentCreate');
            });
        }));
      })
      .then(notifications => {
        notifications.forEach(notification => {
          notification = notification.toJSON();
          notification.from = comment.user;
          const socketId = UtilService.USER_ID_SOCKET_ID_MAP[notification.to];
          if (socketId) {
            sails.sockets.broadcast(socketId, 'notificationNew', notification);
          }
        });
        res.ok();
      })
      .catch(next)
  }

};

