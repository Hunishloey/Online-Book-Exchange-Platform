// utils/logger.js
const { createLogger, format, transports } = require('winston');
const path = require('path');

// Define log levels (priority: error > warn > info > debug)
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// Create logger instance
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug', // Log less in prod
  levels,
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }), // Log full errors
    format.json(), // Structured JSON logs
  ),
  transports: [
    // Console output (colored)
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf((info) => {
          const { timestamp, level, message, ...meta } = info;
          const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
          return `${timestamp} [${level}]: ${message} ${metaString}`;
        }),
      ),
    }),

    // File output (uncomment for production)
    // new transports.DailyRotateFile({
    //   filename: path.join(__dirname, '../logs/application-%DATE%.log'),
    //   datePattern: 'YYYY-MM-DD',
    //   maxSize: '20m',
    //   maxFiles: '14d',
    // }),
  ],
});

module.exports = logger;