const Q = require('q');
/**
 * Post.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
// TODO: add required options
// TODO: add pet type
module.exports = {
  attributes: {
    text: {
      type: 'string',
      required: true
    },
    images: {
      collection: 'PostImage',
      via: 'post',
      required: true
    },
    pets: {
      collection: 'Pet',
      via: 'posts',
      required: true
    },
    user: {
      model: 'User'
    }
  },

  getList(skip = 0, limit = 10) {
    // TODO: find more right way
    let roomsCount = 0;

    return Post.count()
      .then(count => {
        roomsCount = count;
        return Post.find()
          .populate('images')
          .populate('applications')
          .skip(skip)
          .limit(limit)
      })
      .then(rooms => {
        const promises = [];
        rooms.forEach(room => {
          const deferred = Q.defer();
          promises.push(deferred.promise);
          User.findOne({id: room.user})
            .populate('userData')
            .then(user => {
              room = room.toJSON();
              user = user.toJSON();
              room.user = user;
              deferred.resolve(room);
            })
            .catch(deferred.reject);
        });

        return Q.all(promises);
      })
      .then((list) => {
        return {
          count: roomsCount,
          list: list
        }
      });
  },

  getPostById(roomId, userId) {
    // TODO: find more right way
    let room = null;

    return Post.findOne({id: roomId})
      .populate('images')
      .then(data => {
        room = data;
        return User.findOne({id: room.user})
          .populate('userData')
      })
      .then(user => {
        room = room.toJSON();
        user = user.toJSON();
        room.user = user;
        return PostApplication.find({ room: room.id }).where(
          {
            or : [
              { consumer: userId },
              { provider: userId },
              { status: 'FINISHED' }
            ]
          }
        ).sort({createdAt: 'desc'});
      })
      .then(applications => {
        let promises = [];

        applications.forEach(application => {
          let deferred = Q.defer();
          promises.push(deferred.promise);

          User.findOne({id: application.consumer})
            .populate('userData')
            .then(user => {
              user = user.toJSON();
              application.consumer = user;

              deferred.resolve(application);
            })
            .catch(deferred.reject);
        });

        return Q.all(promises);
      })
      .then(applications => {
        room.applications = applications;
        return room;
      });
  },
};
