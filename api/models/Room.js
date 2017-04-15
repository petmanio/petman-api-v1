/**
 * Room.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    name: {
      type: 'string',
      defaultsTo: null
    },
    description: {
      type: 'string',
      defaultsTo: null
    },
    images: {
      collection: 'RoomImage',
      via: 'room'
    },
    user: {
      model: 'User'
    },
  },

  getList(skip = 0, limit = 10) {
    let roomsCount = 0;
    return Room.count()
      .then(count => {
        roomsCount = count;
        return Room.find().populate('images').skip(skip).limit(limit);
      })
      .then(list => {
        return {
          count: roomsCount,
          list
        }
      });
  }
};

