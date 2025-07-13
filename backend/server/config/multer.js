const multer = require('multer');
const storage = multer.memoryStorage();

const configureUpload = (options = {}) => {
  return multer({
    storage,
    limits: {
      fileSize: options.fileSize || 5 * 1024 * 1024, // Default 5MB
      files: options.files || 1, // Default 1 file
      fields: options.fields || 10 // Default 10 fields
    },
    fileFilter: (req, file, cb) => {
      // Default allowed file types
      const allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png', 'image/gif'];
      
      if (!allowedTypes.includes(file.mimetype)) {
        const error = new Error(`Invalid file type. Only ${allowedTypes.join(', ')} are allowed.`);
        error.code = 'LIMIT_FILE_TYPE';
        return cb(error);
      }
      
      cb(null, true);
    }
  });
};

// Standard image upload (5MB limit, single file)
const imageUpload = configureUpload();


module.exports = {
  imageUpload,
  configureUpload
};