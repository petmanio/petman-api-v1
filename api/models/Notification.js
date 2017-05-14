const Q = require('q');
/**
 * Notification.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
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
    roomApplicationMessageCreate: {
      model: 'NotificationRoomApplicationMessageCreate'
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
          .populate('roomApplicationCreate')
          .populate('roomApplicationStatusUpdate')
          .populate('roomApplicationMessageCreate')
          .populate('walkerApplicationCreate')
          .populate('walkerApplicationStatusUpdate')
          .populate('walkerApplicationMessageCreate')
          .populate('adoptCommentCreate')
          .skip(skip)
          .limit(limit)
      })
      .then(notifications => {
        const promises = [];
        notifications.forEach(notification => {
          const deferred = Q.defer();
          promises.push(deferred.promise);
          User.findOne({id: notification.from})
            .populate('userData')
            .then(user => {
              notification = notification.toJSON();
              user = user.toJSON();
              notification.from = user;
              deferred.resolve(notification);
            })
            .catch(deferred.reject);
        });

        return Q.all(promises);
      })
      .then((list) => {
        return {
          count: notificationsCount,
          list: list
        }
      });
  },
};
