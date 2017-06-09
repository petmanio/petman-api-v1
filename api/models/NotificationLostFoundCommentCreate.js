/**
 * NotificationLostFoundCommentCreate.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'notification_lost_found_comment_create',
  attributes: {
    lostFound: {
      model: 'lostFound',
      required: true
    },
    comment: {
      model: 'LostFoundComment',
      required: true
    }
  }
};
