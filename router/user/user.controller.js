const User= require('../../model/User')
const {NotFoundError, ServerError}= require('../../errors')
const {StatusCodes}= require('http-status-codes')

const getUser= async (req, res)=>{
    try {
            const user = await User.findById(req.params.id).select('name profile').lean();
            if (!user){
                throw new NotFoundError('User not Found')
            } 
            const { name, profile } = user;
            const { avatar, bio, phone } = profile || {};
            res.status(StatusCodes.OK).send({msg: 'successful', user: { name, avatar, bio, phone }})
    } catch (error) {
        console.error('error in getting user: ', error)
        throw new ServerError('something went wrong')
    }
}

module.exports= getUser