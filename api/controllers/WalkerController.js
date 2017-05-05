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
	  return Walker.getWalkerById(req.param('walkerId'), req.pmUser.id)
      .then(walker => {
        walker.isOwner = walker.user.id === req.pmUser.id;
        res.json(walker)
      })
      .catch(next)
  },

  apply(req, res, next) {
	  let newApplication;
	  WalkerApplication.findOrCreate({
      consumer: req.pmUser.id,
      provider: req.pmWalker.user,
      walker: req.pmWalker.id,
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
          'walkerApplicationCreate', newApplication);
        res.json(newApplication);
      })
      .catch(next);
  },

  updateApplication(req, res, next) {
	  // TODO: add validations
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
      .then(application => {
        return User.findOne({
          id: req.pmWalkerApplication.provider === req.pmUser.id ? req.pmWalkerApplication.consumer : req.pmWalkerApplication.provider
        });
      })
      .then(userForNotify => {
        sails.sockets.broadcast([userForNotify.socketId].filter(Boolean),
          'walkerApplicationUpdate', req.pmWalkerApplication);
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

    WalkerApplicationMessage.create({
      from: req.pmUser.id,
      to: req.pmWalkerApplication.consumer === req.pmUser.id ?
        req.pmWalkerApplication.provider : req.pmWalkerApplication.consumer,
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
      .then(message => {
        sails.sockets.broadcast([message.from.socketId, message.to.socketId].filter(Boolean),
          'walkerApplicationMessage', message);
        res.ok();
      })
      .catch(next)

  }
};

