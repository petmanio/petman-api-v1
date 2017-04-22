/**
 * AuthProvider.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'auth_provider',
  attributes: {
    user: {
      model: 'User'
    },
    type: {
      type: 'string',
      enum: ['FACEBOOK'],
      required: true
    },
    externalId: {
      type: 'string',
      defaultsTo: null,
      unique: true
    },
    accessToken: {
      type: 'string',
      defaultsTo: null
    }
  }
};

