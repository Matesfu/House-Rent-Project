const express= require('express')
const multer = require('multer');
const path= require('path')
const multerS3 = require('multer-s3');
const s3 = require('../../utils/minioClient');
const authenticateUser= require('../../middleware/authentication')
const {getAllProperty, createProperty, getPropertyWithID, updateProperty, 
    inactivateProperty, uploadImages, activateProperty, getOwnProperty, 
    deleteImageFromProperty}= require('./property.controller')

const propertyRouter= express.Router()
const bucketName = 'images'
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: bucketName,
        acl: 'public-read', // Optional: allow public access
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            const fileName = `${Date.now()}-${file.originalname}`;
            cb(null, fileName); // Unique name
        }
    })
});

propertyRouter.route('/').get(getAllProperty).post(authenticateUser, createProperty)
propertyRouter.route('/own_property').get(authenticateUser, getOwnProperty)
propertyRouter.route('/:id').get(getPropertyWithID).patch(updateProperty).delete(inactivateProperty).patch(activateProperty)
propertyRouter.route('/images/:id').post(authenticateUser, upload.array('images', 5), uploadImages).delete(authenticateUser, deleteImageFromProperty)

module.exports= propertyRouter