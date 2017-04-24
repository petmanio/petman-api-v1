/**
 * AuthController
 *
 * @description :: Server-side logic for managing Auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	login(req, res, next) {
    if (req.body.fb) {
      this.loginFb(...arguments)
    } else if (req.body.local) {
      this.loginLocal();
    } else {
      res.badRequest()
    }
  },

  loginLocal() {
    res.status(501).end();
  },

  loginFb(req, res, next) {
    return AuthService.getUserFbDataByAccessToken(req.body.fb.accessToken)
      .then((fbUser) => {
        return AuthService.findOrCreateFbUser(fbUser, req.body.fb.accessToken);
      })
      .then((user) => {
        return AuthService.signUserId(user.id);
      })
      .then(token => res.ok({ token }))
      .catch(next);
  },

  currentUser(req, res, next) {
    res.ok(req.pmUser.toJSON());
  }
};

