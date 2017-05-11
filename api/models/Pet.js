/**
 * AuthProvider.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'pet',
  attributes: {
    name: {
      type: 'string',
      required: true
    },
    users: {
      collection: 'User',
      via: 'pets'
    },
    posts: {
      collection: 'Post',
      via: 'pets'
    },
    images: {
      collection: 'PetImage',
      via: 'pet',
      required: true
    },
  }
};

