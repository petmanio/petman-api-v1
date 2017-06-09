/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your controllers.
 * You can apply one or more policies to a given controller, or protect
 * its actions individually.
 *
 * Any policy file (e.g. `api/policies/authenticated.js`) can be accessed
 * below by its filename, minus the extension, (e.g. "authenticated")
 *
 * For more information on how policies work, see:
 * http://sailsjs.org/#!/documentation/concepts/Policies
 *
 * For more information on configuring policies, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.policies.html
 */


module.exports.policies = {

  /***************************************************************************
  *                                                                          *
  * Default policy for all controllers and actions (`true` allows public     *
  * access)                                                                  *
  *                                                                          *
  ***************************************************************************/

  // '*': true,
  // '*': ['tokenAuth'],

  AuthController: {
    'currentUser': ['tokenAuth']
  },

  UserController: {
    'storeSocketId': ['tokenAuth']
  },

  NotificationController: {
    'list': ['tokenAuth'],
    'seen': ['tokenAuth']
  },

  RoomController: {
    'create': ['tokenAuth'],
    'getById': ['getUser', 'roomExists'],
    'deleteById': ['getUser', 'roomExists', 'isRoomOwner'],
    'apply': ['tokenAuth', 'roomExists', 'canApplyForRoom'],
    'updateApplication': ['tokenAuth', 'roomApplicationExists', 'isRoomApplicationMember'],
    'getApplicationMessageList': ['tokenAuth', 'roomApplicationExists', 'isRoomApplicationMember'],
    'createApplicationMessage': ['tokenAuth', 'roomApplicationExists', 'isRoomApplicationMember']
  },

  WalkerController: {
    'create': ['tokenAuth'],
    'getById': ['getUser', 'walkerExists'],
    'deleteById': ['getUser', 'walkerExists', 'isWalkerOwner'],
    'apply': ['tokenAuth', 'walkerExists', 'canApplyForWalker'],
    'updateApplication': ['tokenAuth', 'walkerApplicationExists', 'isWalkerApplicationMember'],
    'getApplicationMessageList': ['tokenAuth', 'walkerApplicationExists', 'isWalkerApplicationMember'],
    'createApplicationMessage': ['tokenAuth', 'walkerApplicationExists', 'isWalkerApplicationMember']
  },

  AdoptController: {
    'create': ['tokenAuth'],
    'getById': ['getUser', 'adoptExists'],
    'deleteById': ['getUser', 'adoptExists', 'isAdoptOwner'],
    'getCommentList': ['adoptExists'],
    'joinComment': ['adoptExists'],
    'createComment': ['tokenAuth', 'adoptExists']
  },

  LostFoundController: {
    'create': ['tokenAuth'],
    'getById': ['getUser', 'lostFoundExists'],
    'deleteById': ['getUser', 'lostFoundExists', 'isLostFoundOwner'],
    'getCommentList': ['lostFoundExists'],
    'joinComment': ['lostFoundExists'],
    'createComment': ['tokenAuth', 'lostFoundExists']
  },

  /***************************************************************************
  *                                                                          *
  * Here's an example of mapping some policies to run before a controller    *
  * and its actions                                                          *
  *                                                                          *
  ***************************************************************************/
	// RabbitController: {

		// Apply the `false` policy as the default for all of RabbitController's actions
		// (`false` prevents all access, which ensures that nothing bad happens to our rabbits)
		// '*': false,

		// For the action `nurture`, apply the 'isRabbitMother' policy
		// (this overrides `false` above)
		// nurture	: 'isRabbitMother',

		// Apply the `isNiceToAnimals` AND `hasRabbitFood` policies
		// before letting any users feed our rabbits
		// feed : ['isNiceToAnimals', 'hasRabbitFood']
	// }
};
