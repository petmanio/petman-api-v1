/**
 * BlogController
 *
 * @description :: Server-side logic for managing Blogs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	list(req, res, next) {
	  BlogService.getList(req.query.skip, req.query.limit)
      .then(list => res.ok(list))
      .catch(next);
  }
};

