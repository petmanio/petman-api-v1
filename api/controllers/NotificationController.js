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
	  res.json({
      list: [],
      count: null
    })
  },

  count(req, res, next) {
    res.ok({count: null})
  }
};

