/**
 * UserData.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
const url = require('url');
module.exports = {
  tableName: 'user_data',
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
    },

    toJSON() {
      const obj = this.toObject();
      let avatar = obj.avatar;
      if (!obj.avatar.match("://")) {
        avatar = url.resolve(sails.config.appHost, 'upload' + obj.avatar)
      }
      obj.avatar = avatar;
      return obj;
    }
  }
};

