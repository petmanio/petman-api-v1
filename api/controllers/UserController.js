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
    delete UtilService.USER_ID_SOCKET_ID_MAP[req.pmUser.id];
    req.pmUser.internalUsers.forEach(user => delete UtilService.USER_ID_SOCKET_ID_MAP[user.id]);
    UtilService.USER_ID_SOCKET_ID_MAP[req.pmSelectedUser.id] = sails.sockets.getId(req);
    res.ok();
  }
};

