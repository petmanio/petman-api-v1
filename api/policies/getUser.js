/**
 * getUser
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function(req, res, next) {
  let token;
  if (req.isSocket) {
    token = req.body['x-auth-token'];
    delete req.body['x-auth-token'];
  } else {
    token = req.header('x-auth-token');
  }

  let user;
  req.pmUser = null;
  if (token) {
    AuthService.getUserByToken(token)
      .then((data) => {
      user = data;
        if (user) {
          req.pmUser = user;
        }
        next();
      })
      .catch(err => next());
  } else {
    next();
  }
};