const Q = require('q');
/**
 * LostFound.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
// TODO: add required options
// TODO: add pet type
module.exports = {
  tableName: 'lost_found',
  attributes: {
    description: {
      type: 'string',
      required: true
    },
    images: {
      collection: 'LostFoundImage',
      via: 'lostFound',
      required: true
    },
    comments: {
      collection: 'LostFoundComment',
      via: 'lostFound'
    },
    type: {
      type: 'string',
      enum: ['LOST', 'FOUND'],
      required: true
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

    return LostFound.count({deletedAt: null})
      .then(count => {
        listCount = count;
        return LostFound.find({deletedAt: null})
          .populate('images')
          .skip(skip)
          .limit(limit)
          .sort({createdAt: 'desc'});
      })
      .then(list => {
        const promises = [];
        list.forEach(lostFound => {
          const deferred = Q.defer();
          promises.push(deferred.promise);
          User.findOne({id: lostFound.user})
            .populate('userData')
            .then(user => {
              lostFound = lostFound.toJSON();
              user = user.toJSON();
              lostFound.user = user;
              deferred.resolve(lostFound);
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

  getLostFoundById(lostFoundId) {
    // TODO: find more right way
    let lostFound = null;

    return LostFound.findOne({id: lostFoundId, deletedAt: null})
      .populate('images')
      .then(data => {
        lostFound = data;
        return User.findOne({id: lostFound.user})
          .populate('userData')
      })
      .then(user => {
        lostFound = lostFound.toJSON();
        user = user.toJSON();
        lostFound.user = user;
        return lostFound;
      });
  },

  deleteById(roomId) {
    return LostFound.findOne({id: roomId})
      .populate('images')
      .then(lostFound => {
        // TODO: delete images or not
        // lostFound.images.forEach(image => {
        //   if (!image.src.match("://")) {
        //     fs.unlinkSync(path.join(config.uploadDir, image.src));
        //   }
        // });
        lostFound.deletedAt = new Date();
        return lostFound.save();
      })
  }
};
