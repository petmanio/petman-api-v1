/**
 * WalkerApplication.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
// TODO: add required options
module.exports = {
  tableName: 'walker_application',
  attributes: {
    rating: {
      type: 'integer',
    },
    // TODO: functionality for future
    // count: {
    //   type: 'integer',
    //   required: true
    // },
    review: {
      type: 'string'
    },
    consumer: {
      model: 'User',
      required: true
    },
    provider: {
      model: 'User',
      required: true
    },
    walker: {
      model: 'Walker',
      required: true
    },
    messages: {
      collection: 'WalkerApplicationMessage',
      via: 'application'
    },
    status: {
      type: 'string',
      enum: [
        'WAITING',
        'CANCELED_BY_PROVIDER',
        'CANCELED_BY_CONSUMER',
        'CONFIRMED',
        'FINISHED'
      ],
      defaultsTo: 'WAITING'
    },
    // TODO: functionality for future
    // startedAt: {
    //   type: 'datetime',
    //   required: true
    // },
    finishedAt: {
      type: 'datetime',
      defaultsTo: null
    },
    deletedAt: {
      type: 'datetime',
      defaultsTo: null
    }
  }
};

