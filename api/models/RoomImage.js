/**
 * Room.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'room_image',
  attributes: {
    name: {
      type: 'string',
      defaultsTo: null
    },
    description: {
      type: 'string',
      defaultsTo: null
    },
    thumbnail: {
      type: 'string',
      defaultsTo: null
    },
    room: {
      model: 'Room'
    },
  }
};

