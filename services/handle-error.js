/**
 * if error is an actual Error() Object, will be passed on untouched.
 * else - error should be of format {message: 'reason for error', code: status code}
 * */

// LOCAL IMPORTS
const logger = require('../services/logger');

// HANDLE ERROR
const handleError = function handleError(res, error, path) {
  let code = (error && error.code) ? error.code : 500;

  logger.error(path, error);
  res.status(code).json(error);
};

module.exports = handleError;
