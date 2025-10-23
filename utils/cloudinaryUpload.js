const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');

function uploadBufferToCloudinary(buffer, folder = 'products') {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(error);
        }
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

module.exports = uploadBufferToCloudinary;
