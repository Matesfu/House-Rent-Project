const express= require('express');
const authenticateUser= require('../middleware/authentication')
const router= express.Router()

router.use('/auth', require('./auth/auth.router'))
router.use('/profile', authenticateUser, require('./profile/profile.router'))
router.use('/user', require('./user/user.router'))
router.use('/property', require('./property/property.router'))
module.exports= router