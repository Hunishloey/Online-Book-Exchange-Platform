const sendError = (res, status, message) => res.status(status).json({ success: false, message });
module.exports = {sendError};