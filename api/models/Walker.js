const Q = require('q');
const nestedPop = require('nested-pop');
/**
 * Walker.js
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
    applications: {
      collection: 'WalkerApplication',
      via: 'walker'
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
    let walkersCount = 0;

    return Walker.count()
      .then(count => {
        walkersCount = count;
        return Walker.find()
          .populate('applications')
          .skip(skip)
          .limit(limit)
          .sort({createdAt: 'desc'});
      })
      .then(walkers => {
        const promises = [];
        walkers.forEach(walker => {
          const deferred = Q.defer();
          promises.push(deferred.promise);
          User.findOne({id: walker.user})
            .populate('userData')
            .then(user => {
              walker = walker.toJSON();
              user = user.toJSON();
              walker.user = user;
              deferred.resolve(walker);
            })
            .catch(deferred.reject);
        });

        return Q.all(promises);
      })
      .then((list) => {
        return {
          count: walkersCount,
          list: list
        }
      });
  },

  getWalkerById(walkerId, userId = null) {
    // TODO: find more right way
    let walker = null;

    return Walker.findOne({id: walkerId})
      .then(data => {
        walker = data;
        return User.findOne({id: walker.user})
          .populate('userData')
      })
      .then(user => {
        walker = walker.toJSON();
        user = user.toJSON();
        walker.user = user;
        return WalkerApplication.find({ walker: walker.id }).where(
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
        walker.applications = applications;
        return walker;
      });
  },
};
