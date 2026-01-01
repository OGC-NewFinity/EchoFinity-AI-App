const errorHandler = (err, req, res, _next) => {
  console.error(err.stack || err.message);

  // Default error status and message
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  // Response object
  const response = {
    error: message,
  };

  // Include stack trace in development mode only
  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
