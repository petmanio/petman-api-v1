/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  storeSocketId(req, res, next) {
    if (!req.isSocket) {
      return res.badRequest();
    }

    // TODO: use redis
    UtilService.USER_ID_SOCKET_ID_MAP[req.pmSelectedUser.id] = sails.sockets.getId(req);
    res.ok();
  }
};

