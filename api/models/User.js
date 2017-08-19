/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    email: {
      type: 'string',
      // TODO: when use not allowed email
      // required: true,
      unique: true
    },
    password: {
      type: 'string',
      defaultsTo: null
    },
    authProviders: {
      collection: 'AuthProvider',
      via: 'user'
    },
    pets: {
      collection: 'Pet',
      via: 'users'
    },
    userData:{
      model: 'UserData'
    },
    rooms: {
      collection: 'Room',
      via: 'user'
    },
    socketId: {
      type: 'string',
      defaultsTo: null
    },
    isAdmin: {
      type: 'boolean',
      defaultsTo: false
    },

    toJSON() {
      const obj = this.toObject();
      delete obj.password;
      delete obj.authProviders;
      delete obj.socketId;
      return obj;
    }
  }
};

