/**
 * walkerApplicationExists
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function(req, res, next) {
  const applicationId = req.param('applicationId');
  WalkerApplication.findOne({id: applicationId})
    .then(application => {
      if (application) {
        req.pmWalkerApplication = application;
        return next();
      }
      res.notFound();
    });
};
