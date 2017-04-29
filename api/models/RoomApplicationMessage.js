/**
 * RoomApplicationmessage.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
const Q = require('q');

module.exports = {
  tableName: 'room_application_message',
  attributes: {
    from: {
      model: 'User',
      required: true
    },
    to: {
      model: 'User',
      required: true
    },
    application: {
      model: 'RoomApplication',
      required: true
    },
    message: {
      type: 'string',
      required: true
    },
    seen: {
      type: 'boolean',
      defaultsTo: false
    },
    deletedAt: {
      type: 'datetime',
      defaultsTo: null
    }
  },

  getList(applicationId) {
    // TODO: better way
    return RoomApplicationMessage
      .find({application: applicationId})
      .sort({ createdAt: 'asc' })
      .then(messages => {
        const promises = [];
        messages.forEach(message => {
          message = message.toJSON();
          const deferred = Q.defer();
          promises.push(deferred.promise);
          User.findOne({id: message.to})
            .populate('userData')
            .then(user => {
              message.to = user;
              deferred.resolve(message);
            })
            .catch(deferred.reject)
        });

        return Q.all(promises);
      })
      .then(messages => {
        const promises = [];
        messages.forEach(message => {
          const deferred = Q.defer();
          promises.push(deferred.promise);
          User.findOne({id: message.from})
            .populate('userData')
            .then(user => {
              message.from = user;
              deferred.resolve(message);
            })
            .catch(deferred.reject)
        });

        return Q.all(promises);
      })
      .then(list => {
        return {
          list
        }
      })
  }
};

