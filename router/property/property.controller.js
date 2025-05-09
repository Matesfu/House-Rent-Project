const Properties= require('../../model/Properties')
const User= require('../../model/User')
const {NotFoundError, ServerError, BadRequestError, UnauthenticatedError, ForbiddenError}= require('../../errors')
const checkErrorInst= require('../../middleware/check-error-instance')
const {StatusCodes}= require('http-status-codes')
const fs= require('fs')
const { ServerResponse } = require('http')
const getAllProperty= async (req, res)=>{
    try {
        console.log(req.query)
        const {type, numFilters,
             bedroom, amenities, city, 
             country, address, sort}= req.query
        const queryObject= {}
        if(type){
            queryObject.type= {$regex: type, $options: 'i'} 
        }
        if(city){
            queryObject["location.city"]= {$regex: city, $options: 'i'}
        }
        if(address){
            queryObject["location.address"]= {$regex: address, $options: 'i'}
        }
        if(amenities){
            queryObject["details.amenities"]= {$regex: amenities, $options: 'i'}
        }
        if(bedroom){
            queryObject["details.bedrooms"]= Number(bedroom)
        }
        if(numFilters){
            const operatorMap= {
                '>': '$gt',
                '<': '$lt',
                '>=': '$gte',
                '<=': '$lte',
                '=': '$eq'
            }
            const fieldMap= {
                price: 'price',
                bedroom: 'details.bedrooms',
                floorNumber: 'details.floorNumber'
            }
            const regex= /\b(<|>|<=|>=|=)\b/g
            const filters= numFilters.replace(regex, (match)=> `-${operatorMap[match]}-`)
            filters.split(',').forEach((filter)=>{
                const [field, operator, value]= filter.split('-')
                if(field && operator && value && fieldMap[field]){
                    
                    queryObject[fieldMap[field]]= {[operator]: Number(value)}
                    
                }
            })
        } 
            console.log("queryObject: ", queryObject)
            let result= Properties.find(queryObject).activeOnly()
            if(sort){
                const sortList= sort.split(',').join(' ')
                result = result.sort(sortList)
            }
            else{
                result= result.sort('createdAt')
            }
            const page= Number(req.query.page) || 1
            const limit= Number(req.query.limit) || 15
            const skip= (page-1)*limit
            result.skip(skip).limit(limit)
            const properties= await result
            res.status(StatusCodes.OK).json({msg: 'successfully filtered', properties})
        

    } catch (error) {
        if (checkErrorInst(error)){
            throw error
        }
        console.error('error while getting properties: ', error)
        throw new ServerError('internal server error')
        
    }
}
const getOwnProperty= async (req, res)=>{
    try {
        const userId= req.user?.userId
        if (!userId) {
            throw new UnauthenticatedError('User not authenticated');
          }
      
        const properties = await Properties.find({ createdBy: userId }).sort('-createdAt');
        res.status(StatusCodes.OK).json({
            msg: 'Properties retrieved successfully',
            count: properties.length,
            properties,
          });
    } catch (error) {
        console.error('Get Own Properties Error:', error);
        throw new ServerError('Failed to fetch user properties');
    }
}
const createProperty= async (req, res)=>{
    try {
        const userId= req.user?.userId
        if(!userId){
            throw new UnauthenticatedError("User not authenticated")
        }
        const user= await User.findById(userId)
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
        await user.postController()
        return res.status(StatusCodes.CREATED).json({msg: 'Property created', property: property})
    } catch (error) {
        if (checkErrorInst(error)){
            throw error
        }
      console.error('Error while creating property: ', error)
      throw new ServerError("something went wrong while creating a property")
    }

}
const getPropertyWithID= async(req, res)=>{
    try {
        const propertyId= req.params.id
        const property= await Properties.findOne({_id: propertyId, status: 'active'}).populate('createdBy', 'name email')
        if (!property) {
            throw new NotFoundError('Property not found');
          }
        res.status(StatusCodes.OK).json({ property });

    } catch (error) {
        if (checkErrorInst(error)){
            throw error
        }
       console.error('Error fetching property:', error);
       throw new ServerError("failed to fetch !") 
    }
}
const updateProperty= async (req, res)=>{
    try {
        const propertyId= req.params.id
        const userId= req.user?.userId
        if(!userId){
            throw new UnauthenticatedError('User not authenticated')
        }
        const property= await Properties.findById(propertyId)
        if(!property){
            throw new NotFoundError("Property can't find")
        }
        if (property.createdBy.toString() !== userId){
            throw new ForbiddenError("You are not authorized to update this property")
        }
        
        const allowedFields=[
            'title',
            'type',
            'price',
            'details',
            'location'
        ]
        //then update the allowed fields
        for(const field in allowedFields){
            if(req.body[field]!== undefined){
                property[field]= req.body[field]
            }
        }
        await property.save()
        res.status(StatusCodes.OK).json({
            msg: 'Property updated successfully',
            property,
          });
    } catch (error) {
        if (checkErrorInst(error)){
            throw error
        }
        console.error('Update Property Error:', error);
        throw new ServerError("Failed to update property") 
    }

}
const inactivateProperty= async (req, res)=>{
   try {
    const propertyId = req.params.id
    const userId = req.user?.userId
    if(!userId){
        throw new UnauthenticatedError('User not authenticated'); 
    }
    const property = await Properties.findById(propertyId);

    if (!property) {
      throw new NotFoundError('Property not found');
    }
    // Check if the authenticated user owns the property
    if (property.createdBy.toString() !== userId) {
        throw new ForbiddenError('You are not allowed to inactivate this property');
      }
    if (property.status === 'inactive') {
        throw new BadRequestError('Property is already inactive')
    }
    property.status = 'inactive';
    await property.save();

    res.status(StatusCodes.OK).json({ msg: 'Property has been inactivated successfully' });

   } catch (error) {
        if (checkErrorInst(error)){
            throw error
        }
        console.error('Inactivation Error:', error);
        throw new ServerError('Failed to inactivate property')
    
   } 
}
const activateProperty= async (req, res)=>{
    try {
        const propertyId = req.params.id;
        const userId = req.user?.userId;
    
        if (!userId) {
          throw new UnauthenticatedError('User not authenticated');
        }
        const property = await Properties.findById(propertyId);

        if (!property) {
        throw new NotFoundError('Property not found');
        }

        // Check if the authenticated user owns the property
        if (property.createdBy.toString() !== userId) {
        throw new ForbiddenError('You are not allowed to activate this property');
        }

        if (property.status === 'active') {
        throw new BadRequestError('Property is already active');
        } 
        property.status = 'active';
        await property.save();

        res
        .status(StatusCodes.OK)
        .json({ msg: 'Property has been activated successfully' });
    } catch (error) {
        if (checkErrorInst(error)){
            throw error
        }
        console.error('Activation Error:', error)
        throw new ServerError('Failed to activate property');
    }
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
        const uploadedImages= req.files.map(file => file.location)
        
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
    if (checkErrorInst(error)){
        throw error
    }
    console.error('upload Error: ', error)
    throw new ServerError("Image upload failed")
   } 

}
const deleteImageFromProperty= async (req, res)=>{
   try {
    const propertyId= req.params.id
    const imageUrl= req.body.imageUrl
    const userId= req.user?.userId

    if(!userId){
        throw new UnauthenticatedError('User not authenticated')  
    }
    if(!imageUrl){
        throw new BadRequestError('No image URL provided')
    }
    const property = await Properties.findById(propertyId)
    if (!property) {
        throw new NotFoundError('Property not found');
      }
    if (property.createdBy.toString() !== userId) {
        throw new ForbiddenError('You are not allowed to modify this property');
    }
    // Check if the image exists
    const imageIndex = property.image.indexOf(imageUrl);
    if (imageIndex === -1) {
      throw new NotFoundError('Image not found in property');
    }
    // Remove image from array
    property.image.splice(imageIndex, 1);
    await property.save();

    /*const key = decodeURIComponent(new URL(imageUrl).pathname.substring(1)); // get key from URL
    await s3
      .deleteObject({ Bucket: bucketName, Key: key })
      .promise();*/

    res.status(StatusCodes.OK).json({ msg: 'Image deleted successfully' });

   } catch (error) {
    if (checkErrorInst(error)){
        throw error
    }
    console.error('Image Delete Error:', error);
    throw new ServerError('Failed to delete image');
    
   } 
}

const allProperty= async(req, res)=>{
    const {price, type, bedroom}= req.query
    let queryObject={}
    if(price){
        queryObject.price= Number(price)
    }
    if(type){
        queryObject.type= type
    }
    if(bedroom){
        queryObject["details.bedrooms"]= Number(bedroom)
    }
    console.log(queryObject)
    const property= await Properties.find(queryObject)
    res.status(StatusCodes.OK).json({msg: 'filtered', property: {property}})
}

module.exports= {getAllProperty, createProperty, 
    getPropertyWithID, updateProperty, 
    inactivateProperty, uploadImages,
    activateProperty, getOwnProperty,
    deleteImageFromProperty, allProperty
}