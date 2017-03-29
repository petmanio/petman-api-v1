/**
 * ShopController
 *
 * @description :: Server-side logic for managing Shops
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	list(req, res, next) {
	  ShopService.getList(req.query.skip, req.query.limit)
      .then(list => res.ok(list))
      .catch(next);
  },

  pins(req, res, next) {
    ShopService.getPins()
      .then(pins => res.ok(pins))
      .catch(next);
  }
};

