/**
 * NotificationController
 *
 * @description :: Server-side logic for managing Shops
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const config = sails.config;
const path = require('path');
const fs = require('fs');

module.exports = {
  list(req, res, next) {
    Notification.getList(req.query.skip, req.query.limit, req.pmSelectedUser.id)
      .then(notifications => res.ok(notifications))
      .catch(next);
  },

  seen(req, res, next) {
    Notification.update({id: req.body.notifications, to: req.pmSelectedUser.id}, {seen: true})
      .then(notifications => res.ok({notifications: req.body.notifications}))
      .catch(next);
  }
};
