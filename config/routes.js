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

  'GET /api/versiom': (req, res) => {
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
  'GET /api/room/:roomId/applications': 'RoomController.getApplicationList',
  'DELETE /api/room/:roomId': 'RoomController.deleteById',
  'POST /api/room/create': 'RoomController.create',
  'POST /api/room/:roomId/apply': 'RoomController.apply',
  'PUT /api/room/application/:applicationId/status': 'RoomController.updateApplicationStatus',
  'PUT /api/room/application/:applicationId/rate': 'RoomController.rateApplication',

  'GET /api/walker/list': 'WalkerController.list',
  'GET /api/walker/:walkerId': 'WalkerController.getById',
  'GET /api/walker/:walkerId/applications': 'WalkerController.getApplicationList',
  'DELETE /api/walker/:walkerId': 'WalkerController.deleteById',
  'POST /api/walker/create': 'WalkerController.create',
  'POST /api/walker/:walkerId/apply': 'WalkerController.apply',
  'PUT /api/walker/application/:applicationId/status': 'WalkerController.updateApplicationStatus',
  'PUT /api/walker/application/:applicationId/rate': 'WalkerController.rateApplication',

  'GET /api/adopt/list': 'AdoptController.list',
  'GET /api/adopt/:adoptId': 'AdoptController.getById',
  'DELETE /api/adopt/:adoptId': 'AdoptController.deleteById',
  'POST /api/adopt/create': 'AdoptController.create',
  'GET /api/adopt/:adoptId/comment/list': 'AdoptController.getCommentList',
  'POST /api/adopt/:adoptId/comment/create': 'AdoptController.createComment',
  'GET /api/adopt/:adoptId/comment/join': 'AdoptController.joinComment',

  'GET /api/lost-found/list': 'LostFoundController.list',
  'GET /api/lost-found/:lostFoundId': 'LostFoundController.getById',
  'DELETE /api/lost-found/:lostFoundId': 'LostFoundController.deleteById',
  'POST /api/lost-found/create': 'LostFoundController.create',
  'GET /api/lost-found/:lostFoundId/comment/list': 'LostFoundController.getCommentList',
  'POST /api/lost-found/:lostFoundId/comment/create': 'LostFoundController.createComment',
  'GET /api/lost-found/:lostFoundId/comment/join': 'LostFoundController.joinComment',

  // 'GET /api/question/list': 'QuestionController.list',
  // 'GET /api/question/:questionId': 'QuestionController.getById',
  // 'DELETE /api/question/:questionId': 'QuestionController.deleteById',
  // 'POST /api/question/create': 'QuestionController.create',

  'GET /api/notification/list': 'NotificationController.list',
  'PUT /api/notification/seen': 'NotificationController.seen',

  'GET /api/message/user/:userEntityId/conversation': 'MessageController.getConversation',
  'GET /api/message/conversations': 'MessageController.getConversations',
  'POST /api/massage/user/:userEntityId/create': 'MessageController.create',

  'GET *': 'ClientController.index',

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
