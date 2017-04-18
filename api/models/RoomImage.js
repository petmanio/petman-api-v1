/**
 * Room.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
const path = require('path');
const url = require('url');

module.exports = {
  tableName: 'room_image',
  attributes: {
    src: {
      type: 'string',
      required: true
    },
    room: {
      model: 'Room'
    },

    toJSON() {
      const obj = this.toObject();
      // TODO: user config for upload path, getBaseUrl is deprecated
      return {
        src: url.resolve(sails.config.appHost, 'upload' + obj.src)
      };
    }
  }
};

