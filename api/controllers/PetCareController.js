/**
 * PetCareController
 *
 * @description :: Server-side logic for managing Shops
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	list(req, res, next) {
	  PetCare.getList(req.query.skip, req.query.limit, req.query.type)
      .then(list => res.ok(list))
      .catch(next);
  },

  pins(req, res, next) {
    PetCare.getPins(req.query.type)
      .then(pins => res.ok(pins))
      .catch(next);
  }
};

