/**
 * walkerExists
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function(req, res, next) {
  const walkerId = req.param('walkerId');
  Walker.findOne({id: walkerId})
    .then(walker => {
      if (walker) {
        req.pmWalker = walker;
        return next();
      }
      res.notFound();
    });
};
