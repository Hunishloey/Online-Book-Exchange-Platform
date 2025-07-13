const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const sanitize = require('express-mongo-sanitize'); // Changed import method

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware (MUST COME FIRST)
app.use(helmet());
app.use(cors());

// Rate limiting (100 requests per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Fixed Mongo Sanitization (NEW APPROACH)
app.use((req, _, next) => {
  // Create a new sanitized object instead of modifying read-only properties
  const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key.replace(/[$]/g, '_')] = sanitize.sanitize(value);
    }
    return sanitized;
  };

  // Apply sanitization safely
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.body) req.body = sanitizeObject(req.body);
  next();
});

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Routes
app.get("/", (req, res) => {
  res.send("Hello World");
});

// Import and use routes
const adminRoutes = require('./server/routes/adminRoutes');
const studentRoutes = require('./server/routes/studentRoutes');
app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// MongoDB Connection (Removed deprecated options)
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  const seed = require("./server/config/seed");
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Security features enabled: Helmet, Rate Limiting, NoSQL Sanitization, HPP`);
  });
};

startServer();