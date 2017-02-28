/**
 * UserData.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    user: {
      model: 'User'
    },
    gender: {
      type: 'string',
      enum: ['MALE', 'FEMALE']
    },
    avatar: {
      type: 'string',
      defaultsTo: null
    },
    firstName: {
      type: 'string',
      defaultsTo: null
    },
    lastName: {
      type: 'string',
      defaultsTo: null
    }
  }
};

