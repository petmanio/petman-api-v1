/**
 * QuestionAnswerVote.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
module.exports = {
  tableName: 'question_answer_vote',
  attributes: {
    user: {
      model: 'User',
      required: true
    },
    answer: {
      model: 'QuestionAnswer',
      required: true
    },
    reaction: {
      type: 'integer',
      enum: [-1, 0, 1],
      required: true
    },
    deletedAt: {
      type: 'datetime',
      defaultsTo: null
    }
  }
};

