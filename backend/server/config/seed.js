const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const logger = require('../utilities/logger');
const User = require('../api/user/userModel');

// Required ENV variables
const requiredVars = ['ADMIN_EMAIL', 'ADMIN_PASSWORD', 'SALT_ROUNDS'];
for (const varName of requiredVars) {
  if (!process.env[varName]) {
    throw new Error(`Missing environment variable: ${varName}`);
  }
}

// Corrected metrics object
const metrics = {
  attempts: 0,    // Renamed from retries to attempts
  success: 0,
  failure: 0,
  duration: 0,    // Will track total operation time
};

// Retry mechanism with proper metrics tracking
const retryOperation = async (operation, maxRetries = 3, delay = 500) => {
  const startTime = Date.now();
  let lastError = null;
  let attempts = 0;
  
  while (attempts <= maxRetries) {
    attempts++;
    metrics.attempts = attempts;
    
    try {
      const result = await operation();
      metrics.duration = Date.now() - startTime;
      return result;
    } catch (error) {
      lastError = error;
      if (attempts <= maxRetries) {
        logger.warn(`Attempt ${attempts} failed. Retrying... (${maxRetries - attempts + 1} left)`, {
          error: error.message
        });
        await new Promise(res => setTimeout(res, delay));
      }
    }
  }
  
  metrics.duration = Date.now() - startTime;
  throw lastError;
};

// DI-based createAdmin function without metrics handling
const createAdmin = async ({
  UserModel,
  bcryptLib,
  logger,
  breachChecker,
  env,
  mongooseConnection
}) => {
  const session = await mongooseConnection.startSession();

  try {
    session.startTransaction();

    const adminEmail = env.ADMIN_EMAIL;

    // Checking if admin exists
    const existingAdmin = await UserModel.findOne({ email: adminEmail }).session(session);
    if (existingAdmin) {
      logger.info('Admin already exists. Skipping creation.');
      await session.commitTransaction();
      return;  // Exit early without creating admin
    }

    // Password breach check
    const rawPassword = env.ADMIN_PASSWORD;
    const isBreached = await breachChecker(rawPassword);
    if (isBreached) {
      throw new Error('Password is compromised. Choose a stronger one.');
    }

    // Hash password
    const hashedPassword = await bcryptLib.hash(
      rawPassword, 
      parseInt(env.SALT_ROUNDS)
    );

    // Create admin record
    const admin = new UserModel({
      autoId: 1,
      name: 'admin',
      email: adminEmail,
      password: hashedPassword,
      userType: 1,
    });

    await admin.save({ session });
    await session.commitTransaction();
    logger.info('Admin created successfully', { email: adminEmail });

  } catch (error) {
    await session.abortTransaction();
    logger.error('Admin creation failed', {
      error: error.message,
      stack: error.stack,
    });
    throw error;  // Rethrow for retry mechanism
  } finally {
    session.endSession();
  }
};

// Default breach check function
const checkPasswordBreach = async (password) => {
  return false; // Replace with real API call
};

// Execute with DI and Retry
retryOperation(() =>
  createAdmin({
    UserModel: User,
    bcryptLib: bcrypt,
    logger,
    breachChecker: checkPasswordBreach,
    env: process.env,
    mongooseConnection: mongoose
  })
)
  .then(() => {
    metrics.success = 1;
    logger.info('Admin setup completed successfully');
  })
  .catch((err) => {
    metrics.failure = 1;
    logger.error('Admin setup failed after all attempts', {
      error: err.message,
      stack: err.stack,
    });
  })
  .finally(() => {
    logger.info(`Final metrics: 
      Attempts: ${metrics.attempts}
      Success: ${metrics.success}
      Failure: ${metrics.failure}
      Duration: ${metrics.duration}ms`);
  });