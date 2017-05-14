/**
 * NotificationAdoptCommentCreate.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'notification_adopt_comment_create',
  attributes: {
    adopt: {
      model: 'adopt',
      required: true
    },
    comment: {
      model: 'AdoptComment',
      required: true
    }
  }
};
