const petmanApi = require('../package.json');
/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
  * etc. depending on your default view engine) your home page.              *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  '/': (req, res) => {
    res.json({
      name: petmanApi.name,
      version: petmanApi.version
    });
  },

  'POST /api/auth/login': 'AuthController.login',
  'GET /api/auth/current-user': 'AuthController.currentUser',

  'PUT /api/user/store-socket-id': 'UserController.storeSocketId',

  'GET /api/blog/list': 'BlogController.list',

  'GET /api/shop/list': 'ShopController.list',
  'GET /api/shop/pins': 'ShopController.pins',

  'GET /api/location/list': 'LocationController.list',
  'GET /api/location/pins': 'LocationController.pins',
  'GET /api/location/filters': 'LocationController.filters',

  'GET /api/room/list': 'RoomController.list',
  'GET /api/room/:roomId': 'RoomController.getById',
  'POST /api/room/create': 'RoomController.create',
  'POST /api/room/:roomId/apply': 'RoomController.apply',
  'PUT /api/room/application/:applicationId': 'RoomController.updateApplication',
  'GET /api/room/application/:applicationId/message/list': 'RoomController.getApplicationMessageList',
  'POST /api/room/application/:applicationId/message/create': 'RoomController.createApplicationMessage',

  'GET /api/walker/list': 'WalkerController.list',
  'GET /api/walker/:walkerId': 'WalkerController.getById',
  'POST /api/walker/create': 'WalkerController.create',
  'POST /api/walker/:walkerId/apply': 'WalkerController.apply',
  'PUT /api/walker/application/:applicationId': 'WalkerController.updateApplication',
  'GET /api/walker/application/:applicationId/message/list': 'WalkerController.getApplicationMessageList',
  'POST /api/walker/application/:applicationId/message/create': 'WalkerController.createApplicationMessage',

  'GET /api/notification/list': 'NotificationController.list',
  'PUT /api/notification/seen': 'NotificationController.seen'
  /***************************************************************************
  *                                                                          *
  * Custom routes here...                                                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the custom routes above, it   *
  * is matched against Sails route blueprints. See `config/blueprints.js`    *
  * for configuration options and examples.                                  *
  *                                                                          *
  ***************************************************************************/

};
