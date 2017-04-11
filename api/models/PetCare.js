/**
 * PetCare.js
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
    categories: {
      collection: 'PetCareCategory',
      via: 'petCare',
      dominant: true
    }
  },

  getList(skip = 0, limit = 10, categories) {
    // TODO: find more effective way
    let whereQuery = categories ? { id: categories } : {};
    let petCareIds = [];
    let petCareCount;
    return PetCareCategory.find().where(whereQuery).populate('petCare')
      .then(petCareCategories => {
        petCareCategories.forEach(petCareCategory => petCareCategory.petCare.forEach(c => petCareIds.push(c.id)));
        return PetCare.count().where({id: petCareIds})
      })
      .then(count => {
        petCareCount = count;
        return PetCare.find().where({id: petCareIds}).skip(skip).limit(limit);
      })
      .then(list => {
        return {
          count: petCareCount,
          list
        }
      });

  },

  getPins(categories) {
    // TODO: find more effective way
    let whereQuery = categories ? { id: categories } : {};
    return PetCareCategory.find().where(whereQuery).populate('petCare')
      .then(petCareCategories => {
        let result = [];

        petCareCategories.forEach(c => result = result.concat(c.petCare));
        return result;
      });
  },

  getCategories() {
    // TODO: use PetCare model
    return PetCareCategory.find();
  }
};

