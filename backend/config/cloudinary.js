const cloudinary = require('cloudinary').v2;

function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
    timeout: 120000 // 2 minutes connection timeout
  });
  return cloudinary;
}

configureCloudinary();

module.exports = cloudinary;
module.exports.configureCloudinary = configureCloudinary;

