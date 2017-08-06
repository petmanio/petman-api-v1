/**
 * Message.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
const Q = require('q');
const nestedPop = require('nested-pop');
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
    text: {
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

  getConversations(userId) {
    // TODO: O.o
    let ids = [];
    let total = 0;
    return UtilService.messageQueryAsync(`
      SELECT DISTINCT ON (user_id) *
      FROM (
         SELECT 'out' AS type, id, "to" AS user_id, "createdAt", message
         FROM   message
         WHERE  "from" = ${userId}
      
         UNION  ALL
         SELECT 'in' AS type, id, "from" AS user_id, "createdAt", message
         FROM   message
         WHERE  "to" = ${userId}
         ) sub
      ORDER  BY user_id, "createdAt" DESC;
    `)
      .then(messages => {
        const rows = messages.rows || [];
        ids = rows.map(message => message.id);
        return Message.count({id: ids})
      })
      .then(count => {
        total = count;
        return Message.find({id: ids})
          .populate('from')
          .populate('to')
          .sort({createdAt: 'desc'})
          .then(messages => nestedPop(messages, {
            from: {as: 'user', populate: ['userData']},
            to: {as: 'user', populate: ['userData']},
          }));
      })
      .then(list => {
        return { total, list };
      })
  },

  getConversation(userId, userEntityId) {
    let total = 0;
    return Message.count()
      .where({
        or : [
          { from: userId, to: userEntityId },
          { from: userEntityId, to: userId },
        ],
      })
      .then(count => {
        total = count;
        return Message.find()
          .where({
            or : [
              { from: userId, to: userEntityId },
              { from: userEntityId, to: userId },
            ],
          })
          .populate('from')
          .populate('to')
          .sort({createdAt: 'desc'})
          .then(messages => nestedPop(messages, {
            from: {as: 'user', populate: ['userData']},
            to: {as: 'user', populate: ['userData']},
          }));
      })
      .then(list => {
        return { total, list, }
      });
  }
};

