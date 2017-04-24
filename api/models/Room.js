const Q = require('q');
const nestedPop = require('nested-pop');
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
    schedules: {
      collection: 'RoomSchedule',
      via: 'room'
    },
    user: {
      model: 'User'
    },
    isAvailable: {
      type: 'boolean',
      defaultsTo: true
    }
  },

  getList(skip = 0, limit = 10) {
    // TODO: find more right way
    let roomsCount = 0;

    return Room.count()
      .then(count => {
        roomsCount = count;
        return Room.find()
          .populate('images')
          .populate('schedules')
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

  getRoomById(roomId) {
    // TODO: find more right way
    let room = null;

    return Room.findOne({id: roomId})
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
        return RoomSchedule.find({room: room.id, status: 'CONFIRMED'});
      })
      .then(schedules => {
        let promises = [];

        schedules.forEach(schedule => {
          let deferred = Q.defer();
          promises.push(deferred.promise);

          User.findOne({id: schedule.consumer})
            .populate('userData')
            .then(consumer => {
              consumer = consumer.toJSON();
              schedule.consumer = consumer;
              deferred.resolve(schedule);
            })
            .catch(deferred.reject);
        });

        return Q.all(promises);
      })
      .then(schedules => {
        room.schedules = schedules;
        return room;
      });
  },
};
