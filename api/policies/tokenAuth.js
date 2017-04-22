/**
 * tokenAuth
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function(req, res, next) {

  const token = req.header('x-auth-token');
  if (token) {
    AuthService.getUserByToken(token)
      .then((user) => {
        if (user) {
          req.user = user;
          return next();
        }
        res.unauthorized();
      })
      .catch(err => res.unauthorized());
  } else {
    res.unauthorized();
  }
};
