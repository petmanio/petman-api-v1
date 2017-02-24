/**
 * AuthProvider.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    user: {
      model: 'User'
    },
    provider: {
      type: 'string',
      enum: ['FACEBOOK'],
      required: true
    },
    fbId: {
      type: 'string',
      defaultsTo: null,
      unique: true
    },
    fbAccessToken: {
      type: 'string',
      defaultsTo: null
    }
  }
};

