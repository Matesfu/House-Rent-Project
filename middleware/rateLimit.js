const rateLimit= require('express-rate-limit')

const loginLimit= rateLimit({
    windowMs: 10*60*1000,
    max: 5,
    message: "Too many login attempts, try again after 10 minutes.",
    standardHeaders: true,  // Use modern headers
  legacyHeaders: false 
})

const signupLimit= rateLimit({
    windowMs: 10*60*1000,
    max: 10,
    message: "Too many register attempts, try again after 10 minutes.",
    standardHeaders: true,  //Use modern headers
  legacyHeaders: false 
})

module.exports= {
    loginLimit, signupLimit
}