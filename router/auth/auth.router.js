const {register, login}= require('./auth.controller')
const express= require('express')
const {loginLimit, signupLimit}= require('../../middleware/rateLimit')
const routerAuth= express.Router()

routerAuth.route('/register').post(signupLimit, register)
routerAuth.route('/login').post(loginLimit, login)


module.exports= routerAuth