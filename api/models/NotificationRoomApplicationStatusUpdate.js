/**
 * NotificationRoomApplicationStatusUpdate.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'notification_room_application_status_update',
  attributes: {
    room: {
      model: 'Room',
      required: true
    },
    application: {
      model: 'RoomApplication',
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
