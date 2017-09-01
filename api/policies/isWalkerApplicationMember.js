/**
 * isWalkerApplicationMember
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function(req, res, next) {
  if (req.pmSelectedUser.id === req.pmWalkerApplication.provider || req.pmSelectedUser.id === req.pmWalkerApplication.consumer) {
    return next();
  }
  res.badRequest();
};
