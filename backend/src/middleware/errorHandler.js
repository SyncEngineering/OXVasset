/**
 * Global error handler middleware.
 * Logs error stack and returns standardized JSON response.
 */
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    message: message
  });
};

export default errorHandler;
