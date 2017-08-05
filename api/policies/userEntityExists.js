/**
 * userEntityExists
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function(req, res, next) {
  const userId = req.param('userEntityId');
  if (req.pmUser.id.toString() === userId.toString()) {
    return res.badRequest();
  }
  User.findOne({id: userId})
    .then(user => {
      if (user) {
        req.pmUserEntity = user;
        return next();
      }
      res.notFound();
    });
};
