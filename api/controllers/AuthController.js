/**
 * AuthController
 *
 * @description :: Server-side logic for managing Auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	login(req, res, next) {
    if (req.body.fb) {
      this._loginFb(...arguments)
    } else if (req.body.local) {
      this._loginLocal();
    } else {
      res.badRequest()
    }
  },

  _loginLocal() {
    res.status(501).end();
  },

  _loginFb(req, res, next) {
	  let user;
    return AuthService.getUserFbDataByAccessToken(req.body.fb.accessToken)
      .then((fbUser) => {
        return AuthService.findOrCreateFbUser(fbUser, req.body.fb.accessToken);
      })
      .then((userData) => {
        return User.findOne({id: userData.id})
          .populate('userData')
          .then(userWithUserData => {
            user = userWithUserData;
            return AuthService.signUserId(user.id);
          });
      })
      .then(token => res.ok({ token, user }))
      .catch(next);
  },

  currentUser(req, res, next) {
    res.ok(req.pmUser.toJSON());
  }
};

