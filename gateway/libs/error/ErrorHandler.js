'use strict';

var ServerError = require('./ServerError');
var logging = require('../Logging');
var AppUtil = require('../../libs/AppUtil');

/**
 * The module used for building and formatting the applications http error responses
 *
 * @author Hadi Shayesteh <Hadishayesteh@gmail.com>
 * @since  14 Aug 2017
 *
 * @module ErrorHandler
 */
module.exports = {

  /**
   * This builds up a new error using the passed in validation error object.
   *
   * This creates a uniform structure for all our validation error responses
   *
   * @param {Error} error - The error object that will be prepared for display
   * @param {ClientRequest} request - The http request object
   * @param {IncomingMessage} response - The http response object
   * @param {function} next The callback used to pass control to the next action/middleware
   *
   * @author Hadi Shayesteh <Hadishayesteh@gmail.com>
   * @since  14 Aug 2017
   */
  onError: function (error, request, response, next) {
    if (error.status) {
      error = _prepareError(error, response, error.status);
    } else if (response.statusCode) {
      error = _prepareError(error, response, response.statusCode);
    } else {
      // this means that it is not a validation or customs error so it has to be an internal server error
      error = _prepareServerErrorForDisplay(error, response);
    }
    logging.logAction(logging.logLevels.ERROR, 'An error occurred', error);
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify(error));
  }
};

/**
 * This builds up a new error using the passed in error object.
 *
 * Here we can override the code for different error types
 *
 * @private
 *
 * @param {Error} error - The error object that will be prepared for display
 * @param {IncomingMessage} response - The http response object
 * @param {Number} statusCode - The status code which will be used to determine the type of the error
 *
 * @author Hadi Shayesteh <Hadishayesteh@gmail.com>
 * @since  14 Aug 2017
 *
 * @returns {Error} The error that has been prepared for display
 */
function _prepareError(error, response, statusCode) {

  // This is to change the status code to 406 since it has been incorrectly set to 400 by the lib we are using
  if (!AppUtil.isUndefined(error.message) && error.message.indexOf('Invalid content type') >= 0) {
    statusCode = 406;
  }
  switch (statusCode) {
    case 400:
      error = _prepareClientErrorForDisplay(error);
      response.statusCode = 400;
      break;
    case 405:
      error.code = 'METHOD_NOT_SUPPORTED';
      error = _prepareClientErrorForDisplay(error);
      response.statusCode = 405;
      break;
    case 406:
      error.code = 'CONTENT_TYPE_NOT_SUPPORTED';
      error = _prepareClientErrorForDisplay(error);
      response.statusCode = 406;
      break;
    case 409:
      error = _prepareClientErrorForDisplay(error);
      response.statusCode = 409;
      break;
    case 413:
      error = _prepareClientErrorForDisplay(error);
      response.statusCode = 413;
      break;
    default:
      error = _prepareServerErrorForDisplay(error, response);
  }
  return error;
}

/**
 * This builds up a new Client side error using the passed in error object.
 *
 * @private
 * 
 * @param {Error} error - The error object that will be prepared for display
 *
 * @author Hadi Shayesteh <Hadishayesteh@gmail.com>
 * @since  14 Aug 2017
 *
 * @returns {Object} The error that has been prepared for display
 */
function _prepareClientErrorForDisplay(error) {
  var errForDisplay = {};
  if (error.code) {
    errForDisplay.code = error.code;
  } else {
    errForDisplay.code = 'VALIDATION_ERROR';
  }

  if (error.message) {
    errForDisplay.message = error.message;
  }
  if (error.results) {
    errForDisplay.errors = error.results.errors;
  }
  return errForDisplay;
}

/**
 * This builds up a new Server side error using the passed in error object.
 *
 * @private
 * 
 * @param {Error} error - The error object that will be prepared for display
 * @param {IncomingMessage} response - The http response object
 *
 * @author Hadi Shayesteh <Hadishayesteh@gmail.com>
 * @since  14 Aug 2017
 *
 * @returns {Object} The error that has been prepared for display
 */
function _prepareServerErrorForDisplay(error, response) {
  response.statusCode = 500;
  return new ServerError(error);
}