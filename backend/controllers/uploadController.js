const cloudinary = require('../config/cloudinary');
const multer = require('multer');

// Configure Multer memory storage (no disk storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

async function uploadImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    if (cloudinary.configureCloudinary) {
      cloudinary.configureCloudinary();
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret || cloudName.includes('placeholder') || cloudName === 'your_cloudinary_cloud_name') {
      return res.status(500).json({
        error: 'Cloudinary is not properly configured. Upload failed. Please set valid CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.'
      });
    }

    const streamUpload = () => new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'mission2k38/avatars',
          resource_type: 'image'
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error('Cloudinary avatar image upload failed.'));
          } else {
            resolve(result);
          }
        }
      );

      stream.end(req.file.buffer);
    });

    const result = await streamUpload();

    if (!result || !result.secure_url) {
      return res.status(500).json({ error: 'Cloudinary image upload failed. File was not stored.' });
    }

    return res.json({
      secure_url: result.secure_url,
      public_id: result.public_id,
      url: result.secure_url,
      message: 'Avatar image uploaded to Cloudinary successfully!'
    });
  } catch (error) {
    console.error('Avatar image upload to Cloudinary error:', error);
    return res.status(500).json({ error: 'Error uploading image to Cloudinary: ' + (error.message || 'Image upload failed') });
  }
}

module.exports = {
  upload,
  uploadImage
};

