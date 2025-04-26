const User= require('../../model/User')
const {NotFoundError, ServerError, BadRequestError, UnauthenticatedError}= require('../../errors')
const {StatusCodes}= require('http-status-codes')

const getProfile= async (req, res)=>{
    const userId= req.user.userId
    try {
      const user = await User.findById(userId).select('name profile').lean();
        if (!user){
         throw new NotFoundError('User not Found')
        } 
        const { name, profile } = user;
    const { avatar, bio, phone } = profile || {};
        res.status(StatusCodes.OK).send({msg: 'successful', user: { name, avatar, bio, phone }})
     } catch (error) {
        console.error('error while getting profile: ', error)
         throw new ServerError('something went wrong')
     }
}

const updateProfile = async (req, res) => {
    try {
      const userId = req.user.userId;
      const updates = req.body;
  
      // Disallow password update via this route
      if (updates.password) {
        throw new BadRequestError("Use the dedicated password update route.")
      }
  
      // Optionally, define allowed fields for security
      const allowedUpdates = ['name', 'email', 'role', 'profile'];
      const isValidOperation = Object.keys(updates).every((field) => allowedUpdates.includes(field));
  
      if (!isValidOperation) {
        throw new BadRequestError("Invalid fields in update request.")
      }
  
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true, runValidators: true }
      ).select('-password'); // omit password from response
  
      if (!updatedUser) {
        throw new NotFoundError("User not found.")
      }
  
      res.status(200).json({
        msg: "User updated successfully.",
        user: updatedUser
      });
  
    } catch (error) {
        console.error('error updating profile: ',error)
      throw new ServerError("Something went wrong")
    }
  };

  const updatePassword= async (req, res)=>{
    const {currentPassword, newPassword}= req.body
    if (!currentPassword || !newPassword) {
        throw new BadRequestError('Current and new password are required.')
      }
    try {
        const user= await User.findById(req.user.userId)
        if(!user){
            throw new NotFoundError('User not Found')
        }
        const isMatch= await user.matchPassword(currentPassword)
        if(!isMatch){
            throw new UnauthenticatedError("current password not match") 
        }
        user.password = newPassword;
        await user.save();
        return res.status(StatusCodes.OK).json({ msg: 'Password updated successfully.' });
    } catch (error) {
        console.error('Error updating password:', error);
        throw new ServerError("something went wrong")  
    }
  }

  const deleteAccount = async (req, res) => {
    try {
      const user = await User.findById(req.user.userId).select('name').lean();
  
      if (!user) {
        throw new NotFoundError('User not found');
      }
  
      await User.findByIdAndDelete(req.user.userId);
  
      res
        .status(StatusCodes.GONE)
        .json({ msg: `${user.name} account deleted successfully` });
    } catch (error) {
      console.error('Error while deleting account:', error);
      throw new ServerError('Something went wrong while deleting the account');
    }
  };


module.exports= {
    getProfile, updateProfile, updatePassword, deleteAccount
}