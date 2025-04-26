const User= require('../model/User')
const jwt= require('jsonwebtoken')
const {UnauthenticatedError}= require('../errors')

const auth= async (req, res, next)=>{
    const authHeader= req.headers.authorization
    if(!authHeader || !authHeader.startsWith('Bearer ')){
        throw new UnauthenticatedError("authorization Invalid")
    }
    try {
        const token= authHeader.split(' ')[1]
        const decoded= jwt.verify(token, process.env.JWT_SECRET)
        const {userId, name}= decoded
        req.user= {userId, name}
        next()
    } catch (error) {
        console.error('error in authentication: ', error)
        throw new UnauthenticatedError('Authentication Failed')
    }
}

module.exports= auth