/**
 * Review.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
// TODO: add required options
module.exports = {
  tableName: 'user_review',
  attributes: {
    rating: {
      type: 'float',
      required: true
    },
    text: {
      type: 'string',
      defaultsTo: null
    },
    reviewer: {
      model: 'User'
    },
    user: {
      model: 'User'
    }
  }
};

