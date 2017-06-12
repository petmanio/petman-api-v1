const UrlPattern = require('url-pattern');
const config = sails.config;
const _ = require('lodash');
/**
 * botDetector
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */

module.exports = function(req, res, next) {
  const defaultContext = {
    fbAppId: config.fb.appId,
    url: 'https://petman.io',
    image: 'https://petman.io/assets/logo.png',
    description: 'We are a couple of crazy petlovers, who is eager to transform the love and passion for pets into highly rewarding, loving and fun experiences. Our dream is to become super-helpful for all the petlovers and super-friends for all the pets!',
  };

  const regexp = /baiduspider|twitterbot|facebookexternalhit|rogerbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest|slackbot|vkShare|W3C_Validator/;

  const templatesByUrlRegexp = [{
    pattern: new UrlPattern('/adopt/:adoptId/details'),
    template: 'adopt-details',
    contextFn: (patterns) => {
      return Adopt.findOne({ id: patterns.adoptId })
        .populate('images')
        .then(adopt => {
          let context;
          if (adopt) {
            adopt = adopt.toJSON();
            context = {
              // TODO: use host from config file
              url: `https://petman.io/adopt/${patterns.adoptId}/details`,
                image: (adopt.images.length && adopt.images[0].src),
                description: adopt.description
            }
          }
          return _.extend(defaultContext, context);
        });
    }
  }, {
    pattern: new UrlPattern('/walkers/:walkerId/details'),
    template: 'walkers-details',
    contextFn: (patterns) => {
      return Walker.findOne({ id: patterns.walkerId })
        .then(walker => {
          let context;
          if (walker) {
            walker = walker.toJSON();
            context = {
              // TODO: use host from config file
              url: `https://petman.io/walkers/${patterns.walkerId}/details`,
              image: null,
              description: walker.description
            }
          }
          return _.extend(defaultContext, context);
        });
    }
  }, {
    pattern: new UrlPattern('/rooms/:roomId/details'),
    template: 'rooms-details',
    contextFn: (patterns) => {
      return Room.findOne({ id: patterns.roomId })
        .populate('images')
        .then(room => {
          let context;
          if (room) {
            room = room.toJSON();
            context = {
              // TODO: use host from config file
              url: `https://petman.io/rooms/${patterns.roomId}/details`,
              image: (room.images.length && room.images[0].src),
              description: room.description
            }
          }
          return _.extend(defaultContext, context);
        });
    }
  }];

  // req.headers['user-agent'] = 'facebookexternalhit';

  if (regexp.test(req.headers['user-agent'])) {
    const templateConfig = templatesByUrlRegexp.find(config => config.pattern.match(req.originalUrl));
    if (templateConfig) {
      return templateConfig.contextFn(templateConfig.pattern.match(req.originalUrl))
        .then(context => res.render(templateConfig.template, { context }))
        .catch(() => res.render(templateConfig.template, null));
    }
  }

  next();
};
