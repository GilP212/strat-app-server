// EXTERNAL IMPORTS
const winston = require('winston'),
      {combine, timestamp, json, errors} = winston.format;
require('winston-daily-rotate-file');

const rotateTransport = new (winston.transports.DailyRotateFile)({
  filename: 'ebapp-%DATE%.log',
  dirname: './log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d'
});

const exceptionTransport = new winston.transports.File({
  filename: 'exceptions.log',
  dirname: './log'
});

const consoleTransport = new winston.transports.Console();

const logger = winston.createLogger({
  format: combine(
    timestamp(),
    errors({ stack: true }),
    json()
  ),
  transports: [
    rotateTransport
  ],
  exceptionHandlers: [
    exceptionTransport
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(consoleTransport);
}

module.exports = logger;
