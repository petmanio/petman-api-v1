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
    Notification.getList(req.query.skip, req.query.limit, req.pmUser.id)
      .then(notifications => res.ok(notifications))
      .catch(next);
  }
};
