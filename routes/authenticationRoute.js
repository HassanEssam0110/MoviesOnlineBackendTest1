const express = require('express')
const controller = require('../Controller/authenticationController')

const router = express.Router()

router.route('/login')
    .post(controller.login)

router.route('/signup')
    .post(controller.signup)





module.exports = router;


