const handleUploadErrors = (err, req, res, next) => {
  if (err) {
    let message = 'File upload error';
    let status = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size is too large';
    } else if (err.code === 'LIMIT_FILE_TYPE') {
      message = err.message;
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Too many files uploaded';
    }

    return res.status(status).json({
      success: false,
      message
    });
  }
  next();
};

module.exports = handleUploadErrors;