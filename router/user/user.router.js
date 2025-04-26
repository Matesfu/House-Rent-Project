const express= require('express')
const getUser= require('./user.controller')
const routerUser= express.Router()

routerUser.get('/:id', getUser)


module.exports= routerUser