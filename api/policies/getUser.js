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
    delete req.body['x-auth-token'];
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
        req.pmUser = user;
        if (selectedUserId && selectedUserId.match(/internal/)) {
          const id = parseInt(selectedUserId.replace('internal:', ''), 0);
          req.pmInternalUser = _.find(req.pmUser.internalUsers, {id});
        }
        next();
      })
      .catch(err => next());
  } else {
    next();
  }
};
