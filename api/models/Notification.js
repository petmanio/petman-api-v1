const Q = require('q');
/**
 * Notification.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
// TODO: add required options
// TODO: add pet type
module.exports = {
  attributes: {
    from: {
      model: 'User',
      required: true
    },
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
          .populate('roomApplicationStatusUpdate')
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
