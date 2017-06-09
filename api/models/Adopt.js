const Q = require('q');
/**
 * Adopt.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
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
      model: 'User',
      required: true
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
          .skip(skip)
          .limit(limit)
          .sort({createdAt: 'desc'});
      })
      .then(list => {
        const promises = [];
        list.forEach(adopt => {
          const deferred = Q.defer();
          promises.push(deferred.promise);
          User.findOne({id: adopt.user})
            .populate('userData')
            .then(user => {
              adopt = adopt.toJSON();
              user = user.toJSON();
              adopt.user = user;
              deferred.resolve(adopt);
            })
            .catch(deferred.reject);
        });

        return Q.all(promises);
      })
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
      .then(data => {
        adopt = data;
        return User.findOne({id: adopt.user})
          .populate('userData')
      })
      .then(user => {
        adopt = adopt.toJSON();
        user = user.toJSON();
        adopt.user = user;
        return adopt;
      });
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
