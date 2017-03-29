/**
 * Blog.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    source: {
      type: 'string',
      enum: ['SEEKER'],
      required: true
    },
    description: {
      type: 'string',
      defaultsTo: null
    },
    date: {
      type: 'date',
      defaultsTo: null
    },
    link: {
      type: 'string',
      defaultsTo: null,
      unique: true
    },
    thumbnail: {
      type: 'string',
      defaultsTo: null
    }
  }
};

