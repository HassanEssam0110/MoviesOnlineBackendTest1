const express = require('express');

const controller = require('../Controller/userController')


const { isAdmin } = require('./../Middlewares/authenticatedMiddleware')
const { isAdminAndisUser } = require('./../Middlewares/authenticatedMiddleware')


//create express route object and return it
const router = express.Router();

/*------Start user => Admin------- */
router.route('/user/admin/users')
  .all(isAdmin)
  .get(controller.getAllUser)


router.route('/user/admin/all')
  .all(isAdmin)
  .get(controller.getAllAdmin)

router.route('/user/admin/add')
  .all(isAdmin)
  .patch(controller.addAdmin)

router.route('/user/admin/remove')
  .all(isAdmin)
  .patch(controller.removeAdmin)

router.route('/user/name/:name')
  .all(isAdmin)
  .get(controller.getUserByName)


/*------Start user ------- */
router.route('/user')
  .all(isAdminAndisUser)
  .patch(controller.updateUser)


router.route('/user/:id')
  .all(isAdminAndisUser)
  .get(controller.getUserById)
  .delete(controller.deleteUser)


/* payment */
router.route('/user/accountpro/:id')
  .all(isAdminAndisUser)
  .patch(controller.makeUserPro)


/*------Start user Favorite------- */
router.route('/user/:id/favorites')
  .all(isAdminAndisUser)
  .post(controller.addInFavorite)
  .get(controller.getFavorites)

router.route('/user/:id/favorites/:favoriteId')
  .all(isAdminAndisUser)
  .delete(controller.deleteFavorite)






module.exports = router;



/*
router.route('/user/:id?')
    .get(controller.getUserById)
*/





