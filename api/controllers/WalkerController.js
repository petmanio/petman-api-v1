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
const nestedPop = require('nested-pop');

module.exports = {
  list(req, res, next) {
    Walker.getList(req.query.skip, req.query.limit)
      .then(walkers => {
        if (req.pmUser) {
          walkers.list = walkers.list.map(walker => walker.isOwner = walker.user.id === req.pmUser.id)
        }
        res.ok(walkers)
      })
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
      .then(walker => {
        return Walker.findOne({id: walker.id})
          .populate('user')
          .then(walker => nestedPop(walker, { user: ['userData'] }))
      })
      .then(walker => {
        walker.isOwner = true;
        res.ok(walker);
      })
      .catch(next)
  },

  getById(req, res, next) {
    let averageRaging;
    return WalkerApplication.findOne({walker: req.pmWalker.id})
      .average('rating')
      .then(result => {
        averageRaging = result.rating;
        return Walker.findOne({id: req.pmWalker.id})
          .populate('user')
      })
      .then(walker => nestedPop(walker, { user: ['userData'] }))
      .then(walker => {
        walker.averageRating = averageRaging;
        if (req.pmUser) {
          walker.isOwner = walker.user.id === req.pmUser.id;
        }
        res.ok(walker.toJSON())
      })
      .catch(next);
  },

  deleteById(req, res, next) {
    Walker.deleteById(req.pmWalker.id)
      .then(res.ok())
      .catch(next)
  },

  getApplicationList(req, res, next) {
    WalkerApplication.getApplicationList(req.pmWalker.id, req.pmUser.id)
      .then(applications => res.ok(applications))
      .catch(next)
  },

  apply(req, res, next) {
    let newApplication;
    let userToNotify;
    WalkerApplication.findOrCreate({
      consumer: req.pmUser.id,
      provider: req.pmWalker.user,
      walker: req.pmWalker.id,
      status: 'WAITING'
    })
      .then(application => {
        return WalkerApplication.findOne({id: application.id})
          .populate('consumer')
          .populate('provider')
          .sort({createdAt: 'desc'})
          .then(reviews => nestedPop(reviews, {
            consumer: {as: 'user', populate: ['userData']},
            provider: {as: 'user', populate: ['userData']},
          }));
      })
      .then(application => {
        newApplication = application;
        return User.findOne(application.provider.id);
      })
      .then(data => {
        userToNotify = data;
        return Notification.create({
          from: req.pmUser.id,
          to: userToNotify.id,
          walkerApplicationCreate: {
            walker: newApplication.walker,
            application: newApplication.id
          }
        })
          .then(notification => {
            return Notification.findOne({id: notification.id})
              .populate('walkerApplicationCreate')
              .populate('from')
              .then(notification => nestedPop(notification, {
                from: {as: 'user', populate: ['userData']}
              }));
          });
      })
      .then((notification) => {
        sails.sockets.broadcast(userToNotify.socketId, 'notificationNew', notification);
        sails.sockets.broadcast(userToNotify.socketId, 'walkerApplicationCreate', newApplication);
        res.json(newApplication);
      })
      .catch(next);
  },

  updateApplicationStatus(req, res, next) {
    // TODO: add validations messaged
    let statusIsRight;
    let userToNotifyId;
    let userToNotify;
    let prevStatus = req.pmWalkerApplication.status;
    if (req.body.status === req.pmWalkerApplication.status) {
      return res.ok();
    }

    if (req.pmWalkerApplication.provider === req.pmUser.id) {
      const availableStatuses = ['CANCELED_BY_PROVIDER', 'FINISHED', 'IN_PROGRESS'];
      statusIsRight = availableStatuses.indexOf(req.body.status) !== -1;
      userToNotifyId = req.pmWalkerApplication.consumer;
    } else {
      const availableStatuses = ['CANCELED_BY_CONSUMER', 'FINISHED'];
      statusIsRight = availableStatuses.indexOf(req.body.status) !== -1;
      userToNotifyId = req.pmWalkerApplication.provider;
    }

    if (!statusIsRight) {
      return res.badRequest();
    }

    req.pmWalkerApplication.status = req.body.status;
    req.pmWalkerApplication.save()
      .then(() => {
        return User.findOne({
          id: userToNotifyId
        });
      })
      .then(user => {
        userToNotify = user;
        return Notification.create({
          from: req.pmUser.id,
          to: userToNotify.id,
          walkerApplicationStatusUpdate: {
            walker: req.pmWalkerApplication.walker,
            application: req.pmWalkerApplication.id,
            prevStatus: prevStatus,
            currentStatus: req.pmWalkerApplication.status
          }
        });
      })
      .then(notification => {
        return Notification.findOne({id: notification.id})
          .populate('walkerApplicationStatusUpdate')
          .populate('from')
          .then(notification => nestedPop(notification, {
            from: {as: 'user', populate: ['userData']}
          }));
      })
      .then(notification => {
        sails.sockets.broadcast(userToNotify.socketId, 'notificationNew', notification);
        sails.sockets.broadcast(userToNotify.socketId, 'walkerApplicationStatusUpdate', {
          walkerId: req.pmWalkerApplication.walker,
          applicationId: req.pmWalkerApplication.id,
          status: req.pmWalkerApplication.status
        });
        res.ok();
      })
      .catch(next);
  },

  rateApplication(req, res, next) {
    // TODO: add validations messaged
    let userToNotify;

    // TODO: use policy
    if (req.pmWalkerApplication.consumer !== req.pmUser.id) {
      return res.badRequest();
    }

    if (req.body.status === req.pmWalkerApplication.status) {
      return res.ok();
    }

    req.pmWalkerApplication.rating = req.body.rating;
    req.pmWalkerApplication.review = req.body.review;
    req.pmWalkerApplication.save()
      .then(() => {
        return User.findOne({
          id: req.pmWalkerApplication.provider
        });
      })
      .then(user => {
        userToNotify = user;
        return Notification.create({
          from: req.pmUser.id,
          to: userToNotify.id,
          walkerApplicationRate: {
            walker: req.pmWalkerApplication.walker,
            application: req.pmWalkerApplication.id,
            rating: req.pmWalkerApplication.rating,
            review: req.pmWalkerApplication.review
          }
        });
      })
      .then(notification => {
        return Notification.findOne({id: notification.id})
          .populate('walkerApplicationRate')
          .populate('from')
          .then(notification => nestedPop(notification, {
            from: {as: 'user', populate: ['userData']}
          }));
      })
      .then(notification => {
        sails.sockets.broadcast(userToNotify.socketId, 'notificationNew', notification);
        sails.sockets.broadcast(userToNotify.socketId, 'walkerApplicationRate', {
          walkerId: req.pmWalkerApplication.walker,
          applicationId: req.pmWalkerApplication.id,
          rating: req.pmWalkerApplication.rating,
          review: req.pmWalkerApplication.review
        });
        res.ok();
      })
      .catch(next);
  }
};

