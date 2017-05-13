/**
 * AdoptComment.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
module.exports = {
  tableName: 'adopt_comment',
  attributes: {
    comment: {
      type: 'string',
      required: true
    },
    adopt: {
      model: 'Adopt',
      required: true
    },
    user: {
      model: 'User'
    }
  }
};

