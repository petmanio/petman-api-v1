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
        res.ok(message);
      })
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
    Message.getConversation(req.pmUser.id, req.pmUserEntity.id)
      .then(messages => {
        res.ok(messages);
      })
      .catch(next)
  },
};

