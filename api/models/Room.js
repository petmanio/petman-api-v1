const Q = require('q');
const fs = require('fs');
const config = sails.config;
const path = require('path');

/**
 * Room.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
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
    images: {
      collection: 'RoomImage',
      via: 'room',
      required: true
    },
    applications: {
      collection: 'RoomApplication',
      via: 'room'
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

  deleteById(roomId) {
    return Room.findOne({id: roomId})
      .populate('images')
      .then(room => {
        // TODO: delete images or not
        // room.images.forEach(image => {
        //   if (!image.src.match("://")) {
        //     fs.unlinkSync(path.join(config.uploadDir, image.src));
        //   }
        // });
        room.deletedAt = new Date();
        return room.save();
      })
  }
};
