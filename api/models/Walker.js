/**
 * Walker.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
const Q = require('q');
const fs = require('fs');
const config = sails.config;
const path = require('path');
const nestedPop = require('nested-pop');
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

  getList(skip = 0, limit = 10) {
    let total = 0;
    return Walker.count({deletedAt: null})
      .then(count => {
        total = count;
        return Walker.find({deletedAt: null})
          .populate('user')
          .skip(skip)
          .limit(limit)
          .sort({createdAt: 'desc'})
          .then(walkers => nestedPop(walkers, { user: ['userData'] }))
      })
      .then((list) => {
        return Q.all(list.map(walker => {
          walker = walker.toJSON();
          const deferred = Q.defer();
          WalkerApplication.findOne({walker: walker.id})
            .average('rating')
            .then(result => {
              walker.averageRating = result.rating;
              deferred.resolve(walker);
            });
          return deferred.promise;
        }));
      })
      .then(list => {
        return { total, list };
      })
  },

  deleteById(walkerId) {
    return Walker.findOne({id: walkerId})
      .then(walker => {
        walker.deletedAt = new Date();
        return walker.save();
      })
  }
};
