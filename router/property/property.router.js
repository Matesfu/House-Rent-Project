const express= require('express')
const propertyRouter= express.Router()

propertyRouter.route('/').get(getAllProperty)

module.exports= propertyRouter