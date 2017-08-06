const Q = require('q');
const fs = require('fs');
const config = sails.config;
const path = require('path');

/**
 * Walker.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
// TODO: add required options
// TODO: add pet type
module.exports = {
  attributes: {
    description: {
      type: 'string',
      required: true
    },
    cost: {
      type: 'float',
      required: true
    },
    applications: {
      collection: 'WalkerApplication',
      via: 'walker'
    },
    user: {
      model: 'User'
    },
    deletedAt: {
      type: 'datetime',
      defaultsTo: null
    },

    toJSON() {
      const obj = this.toObject();
      delete obj.deletedAt;
      return obj;
    }
  },

  deleteById(walkerId) {
    return Walker.findOne({id: walkerId})
      .then(walker => {
        walker.deletedAt = new Date();
        return walker.save();
      })
  }
};
