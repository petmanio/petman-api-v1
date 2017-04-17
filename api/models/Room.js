/**
 * Room.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
// TODO: add required options
module.exports = {
  attributes: {
    name: {
      type: 'string',
      required: true
    },
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
    user: {
      model: 'User'
    },
  },

  getList(skip = 0, limit = 10) {
    let roomsCount = 0;
    return Room.count()
      .then(count => {
        roomsCount = count;
        return Room.find().populate('images').populate('user').skip(skip).limit(limit);
      })
      .then(list => {
        return {
          count: roomsCount,
          list
        }
      });
  }
};

