/**
 * Notification.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
const Q = require('q');
const nestedPop = require('nested-pop');

// TODO: add required options
// TODO: update model for not using oneToOne relations
module.exports = {
  attributes: {
    from: {
      model: 'User',
      required: true
    },
    // TODO: create many to many relation for to
    to: {
      model: 'User',
      required: true
    },
    roomApplicationCreate: {
      model: 'NotificationRoomApplicationCreate'
    },
    roomApplicationStatusUpdate: {
      model: 'NotificationRoomApplicationStatusUpdate'
    },
    roomApplicationRate: {
      model: 'NotificationRoomApplicationRate'
    },
    walkerApplicationCreate: {
      model: 'NotificationWalkerApplicationCreate'
    },
    walkerApplicationStatusUpdate: {
      model: 'NotificationWalkerApplicationStatusUpdate'
    },
    walkerApplicationMessageCreate: {
      model: 'NotificationWalkerApplicationMessageCreate'
    },
    adoptCommentCreate: {
      model: 'NotificationAdoptCommentCreate'
    },
    lostFoundCommentCreate: {
      model: 'NotificationLostFoundCommentCreate'
    },
    seen: {
      type: 'boolean',
      defaultsTo: false
    }
  },

  getList(skip = 0, limit = 10, userId) {
    // TODO: find more right way
    let notificationsCount = 0;

    return Notification.count({to: userId})
      .then(count => {
        notificationsCount = count;
        return Notification.find({to: userId})
          .sort({createdAt: 'desc'})
          .populate('from')
          .populate('roomApplicationCreate')
          .populate('roomApplicationStatusUpdate')
          .populate('roomApplicationRate')
          .populate('walkerApplicationCreate')
          .populate('walkerApplicationStatusUpdate')
          .populate('walkerApplicationMessageCreate')
          .populate('adoptCommentCreate')
          .populate('lostFoundCommentCreate')
          .skip(skip)
          .limit(limit)
          .then(notification => nestedPop(notification, {
            from: {as: 'user', populate: ['userData']}
          }));
      })
      .then((list) => {
        return {
          count: notificationsCount,
          list: list
        }
      });
  },
};
