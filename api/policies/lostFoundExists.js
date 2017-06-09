/**
 * lostFoundExists
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function(req, res, next) {
  const lostFoundId = req.param('lostFoundId');
  LostFound.findOne({id: lostFoundId, deletedAt: null})
    .then(lostFound => {
      if (lostFound) {
        req.pmLostFound = lostFound;
        return next();
      }
      res.notFound();
    });
};
