/**
 * RoomImage.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
const path = require('path');
const url = require('url');

module.exports = {
  tableName: 'adopt_image',
  attributes: {
    src: {
      type: 'string',
      required: true
    },
    adopt: {
      model: 'Adopt',
      required: true
    },

    toJSON() {
      const obj = this.toObject();
      let src = obj.src;
      if (!obj.src.match("://")) {
        src = url.resolve(sails.config.appHost, 'upload' + obj.src)
      }
      return {
        src,
      };
    }
  }
};

