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
    // TODO: functionality for future
    // count: {
    //   type: 'integer',
    //   required: true
    // },
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
    status: {
      type: 'string',
      enum: [
        'CONFIRMED',
        'WAITING_CONSUMER_CONFIRM',
        'WAITING_PROVIDER_CONFIRM',
        'DECLINED_BY_CONSUMER',
        'DECLINED_BY_PROVIDER',
        'FINISHED'
      ],
      defaultsTo: 'WAITING_PROVIDER_CONFIRM'
    },
    // TODO: functionality for future
    // startedAt: {
    //   type: 'datetime',
    //   required: true
    // },
    // endedAt: {
    //   type: 'datetime',
    //   required: true
    // },
    deletedAt: {
      type: 'datetime',
      defaultsTo: null
    }
  }
};

