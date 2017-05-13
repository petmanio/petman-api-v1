/**
 * adoptExists
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function(req, res, next) {
  const adoptId = req.param('adoptId');
  Adopt.findOne({id: adoptId})
    .then(adopt => {
      if (adopt) {
        req.pmAdopt = adopt;
        return next();
      }
      res.notFound();
    });
};
