/**
 * Shop.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    name: {
      type: 'string',
      defaultsTo: null
    },
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
    type: {
      type: 'string',
      enum: ['SHOP', 'CLINIC'],
      required: true
    },
  },

  getList(skip = 0, limit = 10, type) {
    let petCareCount;
    let findQuery = type ? {type} : {};
    return PetCare.count(findQuery)
      .then(count => {
        petCareCount = count;
        return PetCare.find(findQuery).skip(skip).limit(limit);
      })
      .then(list => {
        return {
          count: petCareCount,
          list
        }
      });

  },

  getPins(type) {
    let findQuery = type ? {type} : {};
    return PetCare.find(findQuery);
  }
};

