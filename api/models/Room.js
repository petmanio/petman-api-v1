const Q = require('q');
const fs = require('fs');
const config = sails.config;
const path = require('path');

/**
 * Room.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
// TODO: add required options
// TODO: add pet type
module.exports = {
  attributes: {
    // name: {
    //   type: 'string',
    //   required: true
    // },
    description: {
      type: 'string',
      required: true
    },
    cost: {
      type: 'float',
      required: true
    },
    // TODO: functionality for future
    // limit: {
    //   type: 'integer',
    //   required: true
    // },
    images: {
      collection: 'RoomImage',
      via: 'room',
      required: true
    },
    applications: {
      collection: 'RoomApplication',
      via: 'room'
    },
    user: {
      model: 'User'
    },
    deletedAt: {
      type: 'datetime',
      defaultsTo: null
    }
  },

  getList(skip = 0, limit = 10) {
    // TODO: find more right way
    let roomsCount = 0;

    return Room.count({deletedAt: null})
      .then(count => {
        roomsCount = count;
        return Room.find({deletedAt: null})
          .populate('images')
          .populate('applications')
          .skip(skip)
          .limit(limit)
          .sort({createdAt: 'desc'});
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

  getRoomById(roomId, userId = null) {
    // TODO: find more right way
    let room = null;

    return Room.findOne({id: roomId, deletedAt: null})
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
        return RoomApplication.find({ room: room.id }).where(
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

  deleteById(roomId) {
    return Room.findOne({id: roomId})
      .populate('images')
      .then(room => {
        // TODO: delete images or not
        // room.images.forEach(image => {
        //   if (!image.src.match("://")) {
        //     fs.unlinkSync(path.join(config.uploadDir, image.src));
        //   }
        // });
        room.deletedAt = new Date();
        return room.save();
      })
  }
};
