/**
 * Room.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

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
  }
};

