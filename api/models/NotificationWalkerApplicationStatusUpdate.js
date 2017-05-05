/**
 * NotificationWalkerApplicationStatusUpdate.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'notification_walker_application_status_update',
  attributes: {
    walker: {
      model: 'Walker',
      required: true
    },
    application: {
      model: 'WalkerApplication',
      required: true
    },
    prevStatus: {
      type: 'string',
      required: true
    },
    currentStatus: {
      type: 'string',
      required: true
    }
  }
};
