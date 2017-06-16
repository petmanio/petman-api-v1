/**
 * QuestionAnswer.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
module.exports = {
  tableName: 'question_answer',
  attributes: {
    user: {
      model: 'User',
      required: true
    },
    question: {
      model: 'Question',
      required: true
    },
    text: {
      type: 'string',
      required: true
    },
    votes: {
      collection: 'QuestionAnswerVote',
      via: 'answer'
    },
    deletedAt: {
      type: 'datetime',
      defaultsTo: null
    }
  }
};

