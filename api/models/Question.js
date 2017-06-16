/**
 * Question.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
module.exports = {
  attributes: {
    text: {
      type: 'string',
      required: true
    },
    answers: {
      collection: 'QuestionAnswer',
      via: 'question'
    },
    comments: {
      collection: 'QuestionComment',
      via: 'question'
    },
    user: {
      model: 'User',
      required: true
    },
    deletedAt: {
      type: 'datetime',
      defaultsTo: null
    }
  }
};
