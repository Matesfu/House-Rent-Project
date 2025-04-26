// utils/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: 'dwrqn6ct8',
  api_key: '359582796734312',
  api_secret: 'areE_UTHd2B-C_Q-fwZ3Kjq-eR8',
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'user_avatars', // Optional folder name in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

module.exports = {
  cloudinary,
  storage,
};
