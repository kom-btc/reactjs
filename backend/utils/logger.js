const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if not exists
const logsDir = path.join(__dirname, '../logs');
const auditLogsDir = path.join(logsDir, 'audit');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

if (!fs.existsSync(auditLogsDir)) {
  fs.mkdirSync(auditLogsDir);
}

// Get current date for daily log file
const getLogFileName = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `audit-${year}-${month}-${day}.log`;
};

// Winston logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [
    // Console output
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // Daily audit log file
    new winston.transports.File({
      filename: path.join(auditLogsDir, getLogFileName()),
      level: 'info'
    }),
    // Error log file
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error'
    })
  ]
});

module.exports = logger;