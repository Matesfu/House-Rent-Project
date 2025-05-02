const express= require('express')
const authenticateUser= require('../../middleware/authentication')
const {getAllProperty, createProperty, getPropertyWithID, updateProperty, 
    deleteProperty, uploadImages}= require('./property.controller')
const multer = require('multer');
const path= require('path')
const propertyRouter= express.Router()
const storage= multer.diskStorage({
    destination: (req, file, cb)=> cb(null, 'temp/'),
    filename: (req, file, cb)=>{
        const uniqueName= Date.now()+ '-'+ Math.round(Math.random()*1e9) + path.extname(file.originalname)
        cb(null, uniqueName)
    }
})
const upload= multer({storage})

propertyRouter.route('/').get(getAllProperty).post(authenticateUser, createProperty)
propertyRouter.route('/:id').get(getPropertyWithID).patch(updateProperty).delete(deleteProperty)
propertyRouter.route('/images/:id').post(authenticateUser, upload.array('images', 5), uploadImages)

module.exports= propertyRouter