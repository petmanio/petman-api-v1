/**
 * Production environment settings
 *
 * This file can include shared settings for a production environment,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */
const path = require('path');

module.exports = {

  /***************************************************************************
   * Set the default database connection for models in the production        *
   * environment (see config/connections.js and config/models.js )           *
   ***************************************************************************/

  // models: {
  //   connection: 'someMysqlServer'
  // },

  /***************************************************************************
   * Set the port in the production environment to 80                        *
   ***************************************************************************/

  // port: 80,

  /***************************************************************************
   * Set the log level in production environment to "silent"                 *
   ***************************************************************************/

  // log: {
  //   level: "silent"
  // }

  models: {
    connection: 'prodPostgres',
    migrate: 'safe'
  },

  fb: {
    appId: '424363951255305',
    appSecret: '353b283172fe3c8a691b4aa2ed6a66de',
    scope: 'public_profile,email'
  },

  // TODO: user static path config system
  uploadDir: path.join(__dirname, '../../upload'),
  appHost: 'https://petman.io'
};
