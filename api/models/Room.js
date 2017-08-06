/**
 * Room.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
const Q = require('q');
const fs = require('fs');
const config = sails.config;
const path = require('path');
const nestedPop = require('nested-pop');
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

  getList(skip = 0, limit = 10) {
    let total = 0;
    return Room.count({deletedAt: null})
      .then(count => {
        total = count;
        return Room.find({deletedAt: null})
          .populate('images')
          .populate('user')
          .skip(skip)
          .limit(limit)
          .sort({createdAt: 'desc'})
          .then(rooms => nestedPop(rooms, { user: ['userData'] }))
      })
      .then((list) => {
        return Q.all(list.map(room => {
          room = room.toJSON();
          const deferred = Q.defer();
          RoomApplication.findOne({room: room.id})
            .average('rating')
            .then(result => {
              room.averageRating = result.rating;
              deferred.resolve(room);
            });
          return deferred.promise;
        }));
      })
      .then(list => {
        return { total, list };
      })
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
