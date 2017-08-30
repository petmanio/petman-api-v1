/**
 * Adopt.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
const Q = require('q');
const nestedPop = require('nested-pop');

// TODO: add required options
// TODO: add pet type
module.exports = {
  attributes: {
    description: {
      type: 'string',
      required: true
    },
    images: {
      collection: 'AdoptImage',
      via: 'adopt',
      required: true
    },
    comments: {
      collection: 'AdoptComment',
      via: 'adopt'
    },
    user: {
      model: 'User'
    },
    internalUser: {
      model: 'InternalUser'
    },
    deletedAt: {
      type: 'datetime',
      defaultsTo: null
    }
  },

  getList(skip = 0, limit = 10) {
    // TODO: find more right way
    let listCount = 0;

    return Adopt.count({deletedAt: null})
      .then(count => {
        listCount = count;
        return Adopt.find({deletedAt: null})
          .populate('images')
          .populate('user')
          .populate('internalUser')
          .skip(skip)
          .limit(limit)
          .sort({createdAt: 'desc'});
      })
      .then(adopt => nestedPop(adopt, { user: ['userData'] }))
      .then((list) => {
        return {
          count: listCount,
          list: list
        }
      });
  },

  getAdoptById(adoptId) {
    // TODO: find more right way
    let adopt = null;

    return Adopt.findOne({id: adoptId, deletedAt: null})
      .populate('images')
      .populate('user')
      .populate('internalUser')
      .then(adopt => nestedPop(adopt, { user: ['userData'] }))
  },

  deleteById(roomId) {
    return Adopt.findOne({id: roomId})
      .populate('images')
      .then(adopt => {
        // TODO: delete images or not
        // adopt.images.forEach(image => {
        //   if (!image.src.match("://")) {
        //     fs.unlinkSync(path.join(config.uploadDir, image.src));
        //   }
        // });
        adopt.deletedAt = new Date();
        return adopt.save();
      })
  }
};
