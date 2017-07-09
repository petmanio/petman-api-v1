/**
 * LostFoundController
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
	  LostFound.getList(req.query.skip, req.query.limit)
      .then(lostFound => res.ok(lostFound))
      .catch(next);
  },

  create(req, res, next) {
    let uploadedImages = [];
    UtilService.uploadFile(req, 'images', path.join(config.uploadDir, 'images/lost-found'))
      .then(images => {
        uploadedImages = images;
        return LostFound.create({
          description: req.body.description,
          type: req.body.type,
          user: req.pmUser,
          images: images.map(image => {
            return { src: image.fd.replace(config.uploadDir, '') }
          })
        });
      })
      .then(lostFound => res.ok(lostFound.toJSON()))
      .catch(err => {
        uploadedImages.forEach(image => fs.unlink(image.fd));
        next(err)
      })
  },

  getById(req, res, next) {
	  return LostFound.getLostFoundById(req.pmLostFound.id)
      .then(lostFound => {
        if (req.pmUser) {
          lostFound.isOwner = lostFound.user.id === req.pmUser.id;
        } else {
          lostFound.isOwner = false;
        }
        res.json(lostFound)
      })
      .catch(next)
  },

  deleteById(req, res, next) {
    LostFound.deleteById(req.pmLostFound.id)
      .then(res.ok())
      .catch(next)
  },

  getCommentList(req, res, next) {
    LostFoundComment.getList(req.pmLostFound.id, req.query.skip, req.query.limit)
      .then(comments => {
        res.json(comments)
      })
      .catch(next);
  },

  joinComment(req, res, next) {
    if (!req.isSocket) {
      return res.badRequest();
    }

    const roomName = `lost_found_comment_${req.pmLostFound.id}`;
    sails.sockets.join(req, roomName)
  },

  createComment(req, res, next) {
	  let comment;
	  let usersForSendNotification;
    LostFoundComment.create({
      user: req.pmUser.id,
      lostFound: req.pmLostFound.id,
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
        return LostFoundComment.find({ select: ['user'], lostFound: req.pmLostFound.id });
      })
      .then(userComments => {
        const userIds = _(userComments).map('user').concat(req.pmLostFound.user).uniqBy().value();
        return User.find({select: ['id', 'socketId'], id: userIds});
      })
      .then(userToUpdate => {
        usersForSendNotification = _(userToUpdate).filter(user => user.id !== req.pmUser.id).value();

        // TODO: only send new message to receiver using socket
        const roomName = `lost_found_comment_${req.pmLostFound.id}`;
        sails.sockets.broadcast(roomName, 'lostFoundComment', comment);

        return Q.all(usersForSendNotification.map(user => {
          return Notification.create({
            from: req.pmUser.id,
            to: user.id,
            lostFoundCommentCreate: {
              lostFound: req.pmLostFound.id,
              comment: comment.id,
            }
          })
            .then(notification => {
              return Notification.findOne({id: notification.id})
                .populate('lostFoundCommentCreate');
            });
        }));
      })
      .then(notifications => {
        notifications.forEach(notification => {
          notification = notification.toJSON();
          notification.from = comment.user;
          const socketToEmit = _.find(usersForSendNotification, {id: notification.to});
          if (socketToEmit && socketToEmit.socketId) {
            sails.sockets.broadcast(socketToEmit.socketId, 'notificationNew', notification);
          }
        });
        res.ok();
      })
      .catch(next)
  }

};

