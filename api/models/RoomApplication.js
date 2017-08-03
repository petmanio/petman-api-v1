/**
 * RoomApplication.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
// TODO: add required options
const _ = require('lodash');
const nestedPop = require('nested-pop');
module.exports = {
  tableName: 'room_application',
  attributes: {
    rating: {
      type: 'integer',
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
    status: {
      type: 'string',
      enum: [
        'WAITING',
        'CANCELED_BY_PROVIDER',
        'CANCELED_BY_CONSUMER',
        'IN_PROGRESS',
        'FINISHED'
      ],
      defaultsTo: 'WAITING'
    },
    finishedAt: {
      type: 'datetime',
      defaultsTo: null
    },
    deletedAt: {
      type: 'datetime',
      defaultsTo: null
    }
  },

  getApplicationList(roomId, userId = null) {
    let total = 0;
    return RoomApplication.count()
      .where({
        room: roomId,
        or : [
          { consumer: userId },
          { provider: userId },
          { status: 'FINISHED' }
        ]
      })
      .then(count => {
        total = count;
        return RoomApplication
          .find()
          .where({
            room: roomId,
            or : [
              { consumer: userId },
              { provider: userId },
              { status: 'FINISHED' }
            ]
          })
          .populate('consumer')
          .populate('provider')
          .sort({createdAt: 'desc'})
          .then(reviews => nestedPop(reviews, {
            consumer: {as: 'user', populate: ['userData']},
            provider: {as: 'user', populate: ['userData']},
          }));
      })
      .then(list => {
        return { total, list };
      });
  }
};

