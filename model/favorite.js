const mongoose= require('mongoose')

const favoriteSchema= new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'please provide user']
    },
    propertyIds: [
        {
        type: mongoose.Types.ObjectId,
        ref: 'Properties',
        }
    ],
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending',
    }
}, {timestamps: true})


module.exports= mongoose.model('Favorite', favoriteSchema)