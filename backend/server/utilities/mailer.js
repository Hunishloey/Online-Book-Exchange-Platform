const nodemailer = require('nodemailer');
const { EMAIL_USER, EMAIL_PASS } = process.env;

// Create reusable transporter object
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

/**
 * Sends OTP email to the recipient
 * @param {string} recipientEmail - Email address of the recipient
 * @param {string} otp - 6-digit OTP code
 * @param {Date} expiresAt - OTP expiration time
 * @returns {Promise<boolean>} - Returns true if email was sent successfully
 */
const sendOTPEmail = async (recipientEmail, otp, expiresAt) => {
  try {
    if (!recipientEmail || !otp || !expiresAt) {
      throw new Error('Missing required parameters');
    }

    const mailOptions = {
      from: `Marketplace Escrow Service <${EMAIL_USER}>`,
      to: recipientEmail,
      subject: 'Your Delivery Confirmation OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 20px;">
          <h2 style="color: #2c3e50; text-align: center;">Delivery Confirmation</h2>
          <p style="font-size: 16px;">Please use the following OTP to confirm your delivery:</p>
          
          <div style="background: #f8f9fa; padding: 15px; text-align: center; margin: 20px 0; border-radius: 5px;">
            <h1 style="margin: 0; letter-spacing: 5px; color: #2c3e50;">${otp}</h1>
          </div>
          
          <p style="font-size: 14px; color: #7f8c8d;">
            <strong>Valid until:</strong> ${expiresAt.toLocaleString('en-IN', {
              timeZone: 'Asia/Kolkata',
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
          
          <p style="font-size: 14px; color: #7f8c8d;">
            <strong>Note:</strong> This OTP is valid for 24 hours only. 
            If you didn't request this, please ignore this email.
          </p>
        </div>
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${recipientEmail}:`, info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

module.exports = {
  sendOTPEmail
};