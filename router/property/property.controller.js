const Properties= require('../../model/Properties')
const User= require('../../model/User')
const {NotFoundError, ServerError, BadRequestError, UnauthenticatedError, ForbiddenError}= require('../../errors')
const {StatusCodes}= require('http-status-codes')
const {cloudinary}= require('../../utils/cloudinary')
const fs= require('fs')
const getAllProperty= async (req, res)=>{
}
const createProperty= async (req, res)=>{
    try {
        const userId= req.user?.userId
        if(!userId){
            throw new UnauthenticatedError("User not authenticated")
        }
        const user= await User.findById(userId).select('role')
        if(!user){
            throw new NotFoundError("User not found")
        }
        if(user.role=='renter' || ''){
            throw new ForbiddenError("Renter can't create property, Update to Landloard!")
        }
        if('image' in req.body){
            throw new BadRequestError("Image upload is handled separately")
        }
        const propertyData= {
            ...req.body,
            createdBy: userId,
        }
        const property= (await Properties.create({...propertyData}))
        const postRemain= user.postController()
        return res.status(StatusCodes.CREATED).json({msg: 'Property created', property: property})
    } catch (error) {
      console.error('Error while creating property: ', error)
      throw new ServerError("something went wrong while creating a property")
    }

}
const getPropertyWithID= (req, res)=>{

}
const updateProperty= (req, res)=>{

}
const deleteProperty= (req, res)=>{

}
const uploadImages= async (req, res)=>{
   try {
        if(!req.files || req.files.length === 0){
            throw new BadRequestError('No file uploaded')
        }
        console.log(req.user)
        const userId= req.user?.userId
        if(!userId){
            throw new UnauthenticatedError('User not authenticated')
        }
        const uploadedImages= []
        for (const file of req.files){
            const result= await cloudinary.uploader.upload(file.path, {
                folder: 'rent-properties',
            })
            uploadedImages.push(result.secure_url)
            fs.unlinkSync(file.path)
        }
        const propertyId= req.params.id
        console.log(propertyId)
        if(!propertyId){
            throw new BadRequestError('property ID Not Given')
        }
        const property= await Properties.findById(propertyId)
        if(!property){
            throw new NotFoundError("property Not Found")
        }
        property.image= [...(property.image || []), ...uploadedImages]
        await property.save()
        res.status(StatusCodes.OK).json({msg: 'image uploaded successfully', images: uploadedImages,})

   } catch (error) {
    console.error('upload Error: ', error)
    throw new ServerError("Image upload failed")
   } 

}

module.exports= {getAllProperty, createProperty, 
    getPropertyWithID, updateProperty, 
    deleteProperty, uploadImages
}