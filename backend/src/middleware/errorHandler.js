import logger from "../config/logger.js";

export const errorHandler = (err, req, res, next) => {
  logger.error(err.stack);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'An unexpected error occurred';

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    message = err.errors.map(e => e.message.replace(/^Validation error:\s*/, '')).join(', ');
  } else if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'Invalid reference: The associated record does not exist.';
  } else if (err.name === 'SequelizeDatabaseError') {
    statusCode = 400;
    message = 'Database error: ' + err.message;
  }

  const response = {
    success: false,
    status: 'error',
    statusCode,
    message,
  };

  // Attach detailed validation errors if they exist
  if (err.errors) {
    response.errors = err.errors;
  }

  res.status(statusCode).json(response);
};
