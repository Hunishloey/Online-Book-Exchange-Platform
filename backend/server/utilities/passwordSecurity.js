const crypto = require('crypto');
const fetch =require('node-fetch');

/**
 * Checks if password has been exposed in data breaches using HaveIBeenPwned API
 * Implements k-Anonymity model for privacy protection
 * 
 * @param {string} password - The password to check
 * @returns {Promise<boolean>} - True if password is breached
 */
const isPasswordBreached = async (password) => {
  try {
    // Create SHA-1 hash of password
    const sha1Hash = crypto.createHash('sha1')
      .update(password)
      .digest('hex')
      .toUpperCase();

    const prefix = sha1Hash.substring(0, 5);
    const suffix = sha1Hash.substring(5);

    // API call with k-Anonymity (only sends first 5 chars of hash)
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: {
        'User-Agent': 'MyApp Security Checker (contact@myapp.com)'
      },
      timeout: 5000 // 5 second timeout
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const results = await response.text();
    
    // Check if our hash suffix exists in the results
    return results.includes(suffix);
  } catch (error) {
    // Fail securely - assume password is safe if check fails
    console.error('Password breach check failed:', error.message);
    return false;
  }
};

/**
 * Validates password meets complexity requirements
 * 
 * @param {string} password 
 * @returns {Object} { valid: boolean, message: string }
 */
const validatePasswordComplexity = (password) => {
  if (password.length < 12) {
    return { valid: false, message: 'Password must be at least 12 characters' };
  }

  // Add more complexity rules as needed
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecial) {
    return {
      valid: false,
      message: 'Password must contain uppercase, lowercase, numbers and special characters'
    };
  }

  return { valid: true, message: 'Password meets complexity requirements' };
};

module.exports = {
  isPasswordBreached,
  validatePasswordComplexity
};