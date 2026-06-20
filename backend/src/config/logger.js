import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// ANSI color codes for levels (for file logs)
const levelColors = {
    error: '\x1b[31m',   // red
    warn: '\x1b[33m',    // yellow
    info: '\x1b[32m',    // green
    debug: '\x1b[34m',   // blue
    default: '\x1b[37m'  // white
};

const resetColor = '\x1b[0m';

// Custom format for file logs with ANSI color
const fileLogFormat = printf(({ timestamp, level, message, stack }) => {
    const color = levelColors[level] || levelColors.default;
    return `${timestamp} [${color}${level.toUpperCase()}${resetColor}]: ${stack || message}`;
});

// Custom format for console logs (uses winston's built-in colorize)
const consoleLogFormat = printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = winston.createLogger({
    level: 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true })
    ),
    transports: [
        // Console with Winston's colorize
        new winston.transports.Console({
            format: combine(
                colorize({ all: true }),
                consoleLogFormat
            )
        }),

        // File logs with manual ANSI colors
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: combine(fileLogFormat)
        }),

        new winston.transports.File({
            filename: 'logs/combined.log',
            format: combine(fileLogFormat)
        })
    ]
});

export default logger;
