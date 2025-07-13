const cloudinary = require('cloudinary').v2;
require('dotenv').config(); // Add this at the top

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});


const uploadImg = async (buffer, fileName) => {
  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          public_id: fileName,
          overwrite: true
        },
        (error, result) => error ? reject(error) : resolve(result)
      );
      uploadStream.end(buffer);
    });
    return result.secure_url;
  } catch (error) {
    console.error('Image upload error:', error);
    throw new Error('Image upload failed');
  }
};

const uploadPdf = async (buffer, fileName) => {
  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',  // ✅ force raw
          public_id: `${fileName.replace('.pdf', '')}`,
          overwrite: true,
          format: 'pdf'
        },
        (error, result) => error ? reject(error) : resolve(result)
      );
      uploadStream.end(buffer);
    });
    return {
      url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    console.error('PDF upload error:', error);
    throw new Error('PDF upload failed');
  }
};


module.exports = {
  uploadImg,
  uploadPdf
};

//https://res.cloudinary.com/dv5ztycmt/raw/upload/v1751223302/materials/attachments/materials/attachments/1751223584251_1748523463_Date%20Sheet%20R%20%281%29.pdf