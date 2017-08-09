const FB = require('fb');
const q = require('q');
const jwt = require('jsonwebtoken');
const config = sails.config;

FB.options({
  appId:          config.fb.appId,
  appSecret:      config.fb.appSecret
});

module.exports = {
  findUserByFbId(fb_id) {
    return Auth.findOne({fb_id})
      .populate('user')
  },

  getUserDataFromFb(accessToken) {
    FB.setAccessToken(accessToken);
  },

  getUserFbDataByAccessToken(token) {
    FB.setAccessToken(token);
    return new Promise((resolve, reject) => {
      FB.api('me', { fields: 'email,gender,birthday,first_name,last_name,picture.width(360).height(360)' }, (res) => {
        if(!res || res.error) return reject(res.error);
        resolve(res);
      });
    });
  },

  findOrCreateFbUser(fbUser, accessToken) {
    let userInstance;
    return AuthProvider.findOne({externalId: fbUser.id}).populate('user')
      .then((auth) => {
        if (auth) {
          auth.accessToken = accessToken;
          return auth.save().then(() => User.findOneById(auth.user));
        } else {
          // TODO: findOrCreate
          return User.create({
            email: fbUser.email
          })
          .then((user) => {
            userInstance = user;
            return q.all([
              AuthProvider.create({
                type: 'FACEBOOK',
                externalId: fbUser.id,
                accessToken,
                user: user.id
              }),
              UserData.create({
                gender: fbUser.gender.toUpperCase(),
                avatar: fbUser.picture.data.url,
                firstName: fbUser.first_name,
                lastName: fbUser.last_name,
                user: user.id
              })
            ])
          })
          .spread((authProvider, userData, ...args) => {
            userInstance.userData = userData.id;
            userInstance.authProviders.add(authProvider.id);
            return userInstance.save();
          })
          .then(() => userInstance);
        }
      })
  },

  signUserId(id) {
    // console.log(jwt.sign({ id: 2 }, sails.config.session.secret))
    return new Promise((resolve, reject) => {
      try {
        resolve(jwt.sign({ id }, sails.config.session.secret))
      } catch (err) {
        reject(err);
      }
    });
  },

  verifyUserToken(token) {
    return new Promise((resolve, reject) => {
      try {
        resolve(jwt.verify(token, sails.config.session.secret))
      } catch (err) {
        reject(err);
      }
    });
  },

  getUserByToken(token) {
    return this.verifyUserToken(token)
      .then(({ id }) => User.findOneById(id).populate('userData'));
  }
};
