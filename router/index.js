const express= require('express');
const authenticateUser= require('../middleware/authentication')
const router= express.Router()

router.use('/auth', require('./auth/auth.router'))
router.use('/profile', authenticateUser, require('./profile/profile.router'))
router.use('/user', require('./user/user.router'))

module.exports= router