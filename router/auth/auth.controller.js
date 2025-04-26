const {BadRequestError, UnauthenticatedError}= require('../../errors')
const {StatusCodes}= require('http-status-codes')
const User= require('../../model/User')
const register= async (req, res)=>{
    const {name, email, password}= req.body
    if(!name || !email || !password){
        throw new BadRequestError("please provide user, email and password")
    }
    const user= await User.create({name, email, password})
    const token= user.createJWT()
    res.status(StatusCodes.CREATED).json({name: user.getName(), token})
}

const login= async (req, res)=>{
    const {email, password}= req.body
    if(!email || !password){
        throw new BadRequestError("please, provide Email and password")
    }
    const user= await User.findOne({email})
    if(!user){
        throw new UnauthenticatedError("Invalid credential(email not found)")
    }
    const checkPassword= await user.matchPassword(password)
    if(!checkPassword){
        throw new UnauthenticatedError("Invalid credentials(password not match)")
    }
    const token= user.createJWT()
    res.status(StatusCodes.OK).json({name:user.name, token})
}  


module.exports= {
    register,
    login
}