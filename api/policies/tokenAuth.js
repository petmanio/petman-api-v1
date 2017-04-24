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
  let user;
  if (token) {
    AuthService.getUserByToken(token)
      .then((data) => {
      user = data;
        if (user) {
          // TODO: update
          return Room.count({user: user.id})
        }
        res.unauthorized();
      })
      .then(count => {
        user.isSitter = (count !== 0);
        req.pmUser = user;
        next();
      })
      .catch(err => res.unauthorized());
  } else {
    res.unauthorized();
  }
};
