/**
 * ContractController
 *
 * @description :: Server-side logic for managing Shops
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const config = sails.config;
const path = require('path');
const fs = require('fs');

module.exports = {
	list(req, res, next) {
	  this._blogList(...arguments);
  },

  count(req, res, next) {
    RoomSchedule.count({
      or : [
        { provider: req.pmUser.id },
        { consumer: req.pmUser.id }
      ]
    })
      .then(count => res.ok({count}))
      .catch(next);
  },

  _blogList(req, res, next) {
	  RoomSchedule.find({
      or : [
        { provider: req.pmUser.id },
        { consumer: req.pmUser.id }
      ]
    })
      .then(schedules => res.json(schedules))
      .catch(next);
  }
};

