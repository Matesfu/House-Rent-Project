const mongoose= require('mongoose')
const bcrypt= require('bcryptjs')
const jwt= require('jsonwebtoken');

const profileSchema = new mongoose.Schema({
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String, // URL to image
      trim: true,
    },
    bio: {
      type: String,
      maxlength: 300,
    }
  }, { _id: false }); // prevents creation of separate _id for profile
const userSchema= new mongoose.Schema({
    name: {
        type: String,
        required: [true, "please provide the name"],
        minlength: 3,
        maxlength: 50,
        unique: true
    },
    email: {
        type: String,
        required: [true, "please provide the email"],
        match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'please provide valid email'
        ],
        unique: true
    },
    password: {
        type: String,
        required: [true, "please provide the password"],
        minlength: 8,
    },
    role: {
        type: String,
        enum: ['renter', 'landlord'],
        default: 'renter'
    },
    profile : profileSchema,



}, {timestamps: true}) 
userSchema.pre('save', async function(next){
    const salt= await bcrypt.genSalt(10)
    this.password= await bcrypt.hash(this.password, salt)
    next()
})
userSchema.methods.matchPassword= async function(candidatePassword){
    const isCorrect= await bcrypt.compare(candidatePassword, this.password)
    return isCorrect
}
userSchema.methods.createJWT= function (){
    return jwt.sign(
        {userId: this._id, name: this.name},
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_LIFETIME,
        }
    )
}
userSchema.methods.getName= function(){
    return this.name
}

module.exports= mongoose.model('User', userSchema)