/**
 * MessageController
 *
 * @description :: Server-side logic for managing Shops
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const nestedPop = require('nested-pop');

module.exports = {
  create(req, res, next) {
    if (!req.body.text) {
      return res.badRequest();
    }
    Message.create({
      from: req.pmUser.id,
      to: req.pmUserEntity.id,
      text: req.body.text
    })
      .then(message => {
        return Message.findOne({id: message.id})
          .populate('from')
          .populate('to')
          .then(message => nestedPop(message, {
            from: {as: 'user', populate: ['userData']},
            to: {as: 'user', populate: ['userData']},
          }))
      })
      .then(message => res.ok(message))
      .catch(next);
  },
	getConversations(req, res, next) {
	  Message.getConversations(req.pmUser.id)
      .then(messages => {
        res.ok(messages);
      })
      .catch(next)
  },

  getConversation(req, res, next) {
    let userEntity;
    return User.findOne({id: req.pmUserEntity.id})
      .populate('userData')
      .then(user => {
        userEntity = user;
        return Message.getConversation(req.pmUser.id, req.pmUserEntity.id);
      })
      .then(messages => {
        messages.userEntity = userEntity;
        res.ok(messages);
      })
      .catch(next)
  },
};

