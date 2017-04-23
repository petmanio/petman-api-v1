/**
 * RoomSchedule.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
// TODO: add required options
module.exports = {
  tableName: 'room_schedule',
  attributes: {
    rating: {
      type: 'integer',
    },
    count: {
      type: 'integer',
      required: true
    },
    review: {
      type: 'string'
    },
    consumer: {
      model: 'User',
      required: true
    },
    provider: {
      model: 'User',
      required: true
    },
    room: {
      model: 'Room',
      required: true
    },
    startedAt: {
      type: 'datetime',
      required: true
    },
    endedAt: {
      type: 'datetime',
      required: true
    },
    deletedAt: {
      type: 'datetime',
      defaultsTo: null
    }
  }
};

