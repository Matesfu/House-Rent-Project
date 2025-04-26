const mongoose= require('mongoose')

const bookSchema= new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'please provide user']
    },
    propertyId: {
        type: mongoose.Types.ObjectId,
        ref: 'Properties',
        required: [true, 'property Id is not provided']
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending',
    }
}, {timestamps: true})


module.exports= mongoose.model('booking', bookSchema)