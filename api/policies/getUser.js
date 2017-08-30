/**
 * getUser
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
const _ = require('lodash');
module.exports = function(req, res, next) {
  let token;
  let selectedUserId;
  if (req.isSocket) {
    token = req.body['x-auth-token'];
    selectedUserId = req.body['x-selected-user'];
    delete req.body['x-auth-token'];
    delete req.body['x-selected-user'];
  } else {
    token = req.header('x-auth-token');
    selectedUserId = req.header('x-selected-user');
  }

  let user;
  req.pmUser = null;
  if (token) {
    AuthService.getUserByToken(token)
      .then((data) => {
        user = data;
        if (user) {
          req.pmUser = user;
          const pmSelectedUser = _.find(req.pmUser.internalUsers, {id: parseInt(selectedUserId, 0)});
          req.pmSelectedUser = pmSelectedUser || req.pmUser;
          return next();
        }
        next();
      })
      .catch(err => next());
  } else {
    next();
  }
};
