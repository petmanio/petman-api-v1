/**
 * WalkerController
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
	  Walker.getList(req.query.skip, req.query.limit)
      .then(walker => res.ok(walker))
      .catch(next);
  },

  create(req, res, next) {
    Walker.create({
      name: req.body.name,
      description: req.body.description,
      cost: req.body.cost,
      limit: req.body.limit,
      user: req.pmUser
    })
      .then(walker => res.ok(walker.toJSON()))
      .catch(next)
  },

  getById(req, res, next) {
	  return Walker.getWalkerById(req.pmWalker.id, req.pmUser && req.pmUser.id)
      .then(walker => {
        if (req.pmUser) {
          walker.isOwner = walker.user.id === req.pmUser.id;
        } else {
          walker.isOwner = false;
        }
        res.json(walker)
      })
      .catch(next)
  },

  apply(req, res, next) {
	  let newApplication;
    let userForNotify;
    WalkerApplication.findOrCreate({
      consumer: req.pmUser.id,
      provider: req.pmWalker.user,
      walker: req.pmWalker.id,
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
          walkerApplicationCreate: {
            walker: newApplication.walker,
            application: newApplication.id
          }
        })
          .then(notification => {
            return Notification.findOne({id: notification.id})
            .populate('walkerApplicationCreate')
              .populate('walkerApplicationStatusUpdate')
              .populate('walkerApplicationMessageCreate')
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
        sails.sockets.broadcast(userForNotify.socketId, 'walkerApplicationCreate', newApplication);
        res.json(newApplication);
      })
      .catch(next);
  },

  updateApplication(req, res, next) {
	  // TODO: add validations
    let userForNotify;
    let notification;
    let prevStatus = req.pmWalkerApplication.status;
    if (req.pmWalkerApplication.status === 'FINISHED' &&
      !req.pmWalkerApplication.review && req.pmWalkerApplication.provider === req.pmUser.id) {
      return res.json(req.pmWalkerApplication);
    }

    req.pmWalkerApplication.status = req.body.status;
    if (req.pmWalkerApplication.status === 'FINISHED') {
      req.pmWalkerApplication.finishedAt = new Date();
      req.pmWalkerApplication.review = req.body.review;
      req.pmWalkerApplication.rating = req.body.rating;
    }
    req.pmWalkerApplication.save()
      .then(() => {
        return User.findOne({
          id: req.pmWalkerApplication.provider === req.pmUser.id ? req.pmWalkerApplication.consumer : req.pmWalkerApplication.provider
        });
      })
      .then(data => {
        userForNotify = data;
        return Notification.create({
          from: req.pmUser.id,
          to: userForNotify.id,
          walkerApplicationStatusUpdate: {
            walker: req.pmWalkerApplication.walker,
            application: req.pmWalkerApplication.id,
            prevStatus: prevStatus,
            currentStatus: req.pmWalkerApplication.status
          }
        })
          .then(notification => {
            return Notification.findOne({id: notification.id})
              .populate('walkerApplicationCreate')
              .populate('walkerApplicationStatusUpdate')
              .populate('walkerApplicationMessageCreate');
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
        sails.sockets.broadcast(userForNotify.socketId, 'walkerApplicationUpdate', req.pmWalkerApplication);
        sails.sockets.broadcast(userForNotify.socketId, 'notificationNew', notification);
        res.json(req.pmWalkerApplication);
      })
      .catch(next);
  },

  getApplicationMessageList(req, res, next) {
	  WalkerApplicationMessage.getList(req.pmWalkerApplication.id)
      .then(messages=> {
        res.json(messages)
      })
      .catch(next);
  },

  createApplicationMessage(req, res, next) {
	  // TODO: application status validation
    let message;
    WalkerApplicationMessage.create({
      from: req.pmUser.id,
      to: req.pmWalkerApplication.consumer === req.pmUser.id ?
        req.pmWalkerApplication.provider : req.pmWalkerApplication.consumer,
      walker: req.pmWalkerApplication.walker,
      message: req.body.message,
      application: req.pmWalkerApplication.id
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
          walkerApplicationMessageCreate: {
            walker: req.pmWalkerApplication.walker,
            application: req.pmWalkerApplication.id,
            message: message.id,
          }
        })
          .then(notification => {
            return Notification.findOne({id: notification.id})
              .populate('walkerApplicationCreate')
              .populate('walkerApplicationStatusUpdate')
              .populate('walkerApplicationMessageCreate');
          })
      })
      .then(notification => {
        notification = notification.toJSON();
        notification.from = message.from;

        sails.sockets.broadcast([message.from.socketId, message.to.socketId].filter(Boolean),
          'walkerApplicationMessage', message);

        sails.sockets.broadcast(message.to.socketId, 'notificationNew', notification);
        res.ok();
      })
      .catch(next)

  }
};

