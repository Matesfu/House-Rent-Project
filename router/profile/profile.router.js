const express= require('express')
const {getProfile, updateProfile, updatePassword, deleteAccount, setLandlord}= require('./profile.controller')
const routerProfile= express.Router()

routerProfile.get('/', getProfile)
routerProfile.post('/landlord', setLandlord)
routerProfile.patch('/', updateProfile)
routerProfile.patch('/update-password', updatePassword)
routerProfile.delete('/', deleteAccount)

module.exports= routerProfile