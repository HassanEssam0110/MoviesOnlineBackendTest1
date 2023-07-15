const express = require('express');
const controller = require('../Controller/userRequestController')
const router = express.Router();

const { isAdmin } = require('./../Middlewares/authenticatedMiddleware')
const { isAdminAndisUser } = require('./../Middlewares/authenticatedMiddleware')


router.get('/userRequest', isAdmin, controller.getAllUserRequest)
router.post('/userRequest', isAdminAndisUser, controller.addUserRequest)


// get user requestes
router.get('/userRequest/:userId', isAdminAndisUser, controller.getUserRequests)

router.patch('/userRequest/request/:reqId', isAdmin, controller.adminResponse)

module.exports = router
