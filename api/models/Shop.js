/**
 * Shop.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    description: {
      type: 'string',
      defaultsTo: null
    },
    link: {
      type: 'string',
      defaultsTo: null
    },
    thumbnail: {
      type: 'string',
      defaultsTo: null
    },
    lat: {
      type: 'float',
      defaultsTo: null
    },
    lng: {
      type: 'float',
      defaultsTo: null
    },
    lang: {
      type: 'string',
      defaultsTo: 'en'
    }
  }
};

