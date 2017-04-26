/**
 * roomExists
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function(req, res, next) {
  const roomId = req.param('roomId');
  Room.findOne({id: roomId})
    .then(room => {
      if (room) {
        req.pmRoom = room;
        return next();
      }
      res.notFound();
    });
};
