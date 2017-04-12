/**
 * Location.js
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
      collection: 'Category',
      via: 'locations',
    }
  },

  getList(skip = 0, limit = 10, categories) {
    // TODO: find more effective way
    let whereQuery = categories ? { id: categories } : {};
    let locationIds = [];
    let locationsCount;
    return Category.find().where(whereQuery).populate('locations')
      .then(categories => {
        categories.forEach(category => category.locations.forEach(location => locationIds.push(location.id)));
        return Location.count().where({id: locationIds})
      })
      .then(count => {
        locationsCount = count;
        return Location.find().where({id: locationIds}).skip(skip).limit(limit);
      })
      .then(list => {
        return {
          count: locationsCount,
          list
        }
      });

  },

  getPins(categories) {
    // TODO: find more effective way
    let whereQuery = categories ? { id: categories } : {};

    return Category.find().where(whereQuery).populate('locations')
      .then(categories => {
        let result = [];

        categories.forEach(category => result = result.concat(category.locations));
        return result;
      });
  },

  getCategories() {
    // TODO: use Location model
    return Category.find();
  }
};

