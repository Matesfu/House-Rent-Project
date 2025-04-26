const express= require('express')
const {getProfile, updateProfile, updatePassword, deleteAccount}= require('./profile.controller')
const routerProfile= express.Router()

routerProfile.get('/', getProfile)
routerProfile.patch('/', updateProfile)
routerProfile.patch('/update-password', updatePassword)
routerProfile.delete('/', deleteAccount)

module.exports= routerProfile