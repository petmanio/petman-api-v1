const Q = require('q');
const nestedPop = require('nested-pop');
/**
 * Room.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
// TODO: add required options
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
    images: {
      collection: 'RoomImage',
      via: 'room',
      required: true
    },
    user: {
      model: 'User'
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
          .populate('user')
          .skip(skip).limit(limit)
      })
      .then(rooms => {
        const promises = [];
        rooms.forEach(room => {
          const deferred = Q.defer();
          promises.push(deferred.promise);
          UserReview.find({user: room.user.id})
            .then(reviews => {
              return User.findOne({id: room.user.id}).populate('userData')
                .then(user => {
                  room = room.toJSON();
                  user = user.toJSON();
                  user.reviews = reviews;
                  room.user = user;
                  deferred.resolve(room);
                });
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

    // const roomQuery = Q.nbind(Room.query, {rowAsArray: true});
    //
    // return roomQuery(`
    //   SELECT *
    //   FROM room as r
    //     INNER JOIN public."user" as u ON r."user" = u.id
    //     INNER JOIN user_review as ur ON u.id = ur."user"
    //     INNER JOIN public."user" as reviewer ON ur.reviewer = u.id;
    // `)
    //   .then(result => {
    //     return result.rows
    //   })
  }
};
