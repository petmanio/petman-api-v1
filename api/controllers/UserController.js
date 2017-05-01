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

    req.pmUser.socketId = sails.sockets.getId(req);
    req.pmUser.save()
      .then(() => res.ok())
      .catch(next)
  }
};

