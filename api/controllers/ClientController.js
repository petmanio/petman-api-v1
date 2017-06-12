const path = require('path');
/**
 * ClientController
 *
 * @description :: Server-side logic for managing Client
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  index(req, res, next) {
    res.sendfile(path.join(__dirname, '../../client/index.html'));
  },
};

