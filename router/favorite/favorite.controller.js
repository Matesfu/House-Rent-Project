const {NotFoundError, ServerError, BadRequestError, UnauthenticatedError, ForbiddenError}= require('../../errors')
const {StatusCodes}= require('http-status-codes')
const checkErrorInst= require('../../middleware/check-error-instance')
const Favorite= require('../../model/favorite')
const Properties= require('../../model/Properties')

const getFavoriteProperty= async (req, res)=>{
    try {
       const userId= req.user?.userId
       if(!userId){
        throw new UnauthenticatedError('user not authenticated')
       } 

       const favoriteProp= await Favorite.findOne({userId}).populate({path: 'propertyIds',
        match: { status: 'active' }  // Only populate properties with status 'active'
    })
       if(!favoriteProp || favoriteProp.propertyIds.length === 0){
        return res.status(StatusCodes.OK).json({ msg: 'No favorite properties found', properties: [] });
       }
       res.status(StatusCodes.OK).json({
        msg: 'Favorite properties retrieved successfully',
        properties: favoriteProp.propertyIds
      })
    } catch (error) {
        if (checkErrorInst(error)){
                    throw error
                } 
        console.error('Error fetching favorite properties:', error);
        throw new ServerError('Failed to retrieve favorite properties'); 
    }
}
const removeFavoriteProperty= async (req, res)=>{
    try {
        const userId= req.user?.userId
        const propertyId= req.params.id
        if (!userId) {
            throw new UnauthenticatedError('User not authenticated');
          }
        if (!propertyId) {
            throw new BadRequestError('Property ID is required');
          }
        const favorite= await Favorite.findOne({userId})
        if(!favorite){
            throw new NotFoundError('Favorites not found for this user')
        }
        const updatedPropertyIds= favorite.propertyIds.filter((id)=>id.toString()!==propertyId)
        favorite.propertyIds= updatedPropertyIds
        await favorite.save()

        res.status(StatusCodes.OK).json({
            msg: 'Property removed from favorites successfully',
            propertyIds: favorite.propertyIds,
          });
    } catch (error) {
        if (checkErrorInst(error)){
                    throw error
                } 
        console.error('Error removing favorite property:', error);
        throw new ServerError('Failed to remove property from favorites');  
    }
}
const addToFavorite= async (req, res)=>{
    try {
        const userId = req.user?.userId;
        const { propertyId } = req.body;
    
        if (!userId) {
          throw new UnauthenticatedError('User not authenticated');
        }
    
        if (!propertyId) {
          throw new BadRequestError('Property ID is required');
        }
    
        // Ensure the property exists
        const propertyExists = await Properties.findById(propertyId).activeOnly();
        if (!propertyExists) {
          throw new NotFoundError('Property not found');
        }
    
        let favoriteDoc = await Favorite.findOne({ userId });
    
        if (!favoriteDoc) {
          // Create a new favorites document for the user
          favoriteDoc = new Favorite({
            userId,
            propertyIds: [propertyId],
          });
        } else {
          // Check if the property is already in favorites
          const alreadyFavorited = favoriteDoc.propertyIds.some(
            (id) => id.toString() === propertyId
          );
    
          if (alreadyFavorited) {
            return res.status(StatusCodes.OK).json({
              msg: 'Property is already in favorites',
              propertyIds: favoriteDoc.propertyIds,
            });
          }
    
          // Add the property to the list
          favoriteDoc.propertyIds.push(propertyId);
        }
    
        await favoriteDoc.save();
    
        res.status(StatusCodes.OK).json({
          msg: 'Property added to favorites successfully',
          propertyIds: favoriteDoc.propertyIds,
        });
      } catch (error) {
        if (checkErrorInst(error)){
                    throw error
                } 
        console.error('Error adding property to favorites:', error);
        throw new ServerError('Failed to add property to favorites');
      } 
}
module.exports= {
    getFavoriteProperty, removeFavoriteProperty, addToFavorite
}