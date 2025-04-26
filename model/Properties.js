const { Timestamp } = require('bson');
const mongoose= require('mongoose')

const propertySchema= new mongoose.Schema({
    title: {
        type: String,
        require: [true, "please provide the title"],
        maxlength: 500,
        },
    type: {
        type: String,
        enum: ['condominium', 'apartment', 'house', 'villa'],
        default: 'house',
    },
    price: {
        type: Number,
        require: [true, "please provide the price"],
    },
    details: {
        floorNumber: Number,
        bedrooms: Number,
        ceramic: Boolean,
        amenities: [String],//wifi, eleviator....

        
      },
      location: {
        city: String,
        country: String,
        address: String
      },
      image: {
        type: [String], // This will store the URL to the image
        required: true,
      },
      createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide user']
    }

}, {timestamps: true})

propertySchema.pre('save', function(next) {
    if (this.type === 'condominium') {
      if (this.details.floorNumber === undefined) {
        return next(new Error('floorNumber is required for condominiums.'));
      }
    }
    next();
  });



module.exports= mongoose.model('properties', propertySchema)