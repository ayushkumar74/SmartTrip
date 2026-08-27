/**
 * Standardize API success responses
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Success message
 * @param {Object|Array} data - Payload data
 */
export const sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Standardize API error responses
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Error message
 * @param {Object|Array} errors - Detailed errors (e.g., validation errors)
 */
export const sendError = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
  const response = {
    success: false,
    message,
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  res.status(statusCode).json(response);
};
