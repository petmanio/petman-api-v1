/**
 * QuestionController
 *
 * @description :: Server-side logic for managing Shops
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const config = sails.config;
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const Q = require('q');

module.exports = {
	list(req, res, next) {
	  Question.getList(req.query.skip, req.query.limit)
      .then(questions => res.ok(questions))
      .catch(next);
  },

  create(req, res, next) {
    Question.create({
      description: req.body.description,
      user: req.pmSelectedUser,
      images: images.map(image => {
        return { src: image.fd.replace(config.uploadDir, '') }
      })
    })
    .then(question => res.ok(question.toJSON()))
    .catch(next)
  },

  getById(req, res, next) {
	  return Question.getQuestionById(req.pmQuestion.id)
      .then(question => {
        if (req.pmSelectedUser) {
          question.isOwner = question.user.id === req.pmSelectedUser.id;
        } else {
          question.isOwner = false;
        }
        res.json(question)
      })
      .catch(next)
  },

  deleteById(req, res, next) {
    Question.deleteById(req.pmQuestion.id)
      .then(res.ok())
      .catch(next)
  },

};

