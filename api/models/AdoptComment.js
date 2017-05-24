/**
 * AdoptComment.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

const Q = require('q');
module.exports = {
  tableName: 'adopt_comment',
  attributes: {
    comment: {
      type: 'string',
      required: true
    },
    adopt: {
      model: 'Adopt',
      required: true
    },
    user: {
      model: 'User'
    }
  },

  getList(adoptId, skip = 0, limit = 10) {
    // TODO: better way
    // TODO: add limit and skip
    let total = 0;
    return AdoptComment.count({ adopt: adoptId })
      .then(count => {
        total = count;
        return AdoptComment
          .find({ adopt: adoptId })
          .sort({ createdAt: 'desc' })
          .skip(skip)
          .limit(limit);
      })
      .then(comments => {
        const promises = [];
        comments.forEach(comment => {
          comment = comment.toJSON();
          const deferred = Q.defer();
          promises.push(deferred.promise);
          User.findOne({id: comment.user})
            .populate('userData')
            .then(user => {
              comment.user = user;
              deferred.resolve(comment);
            })
            .catch(deferred.reject)
        });

        return Q.all(promises);
      })
      .then(list => {
        return {
          list: list.reverse(),
          adoptId,
          total
        }
      })
  }
};

