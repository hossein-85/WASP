'use strict';

var ValidationError = require('../libs/error/ValidationError');
var ResourceNotFoundError = require('../libs/error/ResourceNotFoundError');
var AuthorizationError = require('../libs/error/AuthorizationError');
var RuntimeError = require('../libs/error/RuntimeError');
var AppUtil = require('../libs/AppUtil');

/**
 * An instance of the service helper
 *
 * @author Ryno Hartzer <ryno.hartzer@a24group.com>
 * @since  03 October 2016
 *
 * @module ServiceHelper
 */
module.exports = {

  /**
   * Create a context object from the context header
   *
   * @param {string} contextString - The context header value
   *
   * @author Ryno Hartzer <ryno.hartzer@a24group.com>
   * @since  29 Sep 2016
   *
   * @returns {Object} - A context object in the format {'id': '123', 'type': 'Agency'}
   */
  createContext: function createContext(contextString) {
    var id = '';
    var type = contextString;
    if (contextString.indexOf(' ') != -1) {
      id = contextString.substring(contextString.indexOf(' ') + 1);
      type = contextString.substring(0, contextString.indexOf(' '));
    }
    return {
      'id': id,
      'type': type
    };
  },

  /**
   * This will handle the response errors that we received from the authorization request
   *
   * Some of the errors will be returned to the client and the rest will result in a server side error
   *
   * @param {object} resError - The response error object
   *
   * @author Hossein Shayesteh <hossein.shayesteh@a24group.com>
   * @since  28 September 2016
   *
   * @return {Error} Return error that will be shown to user
   */
  handleGetListResponseErrors: function handleGetListResponseErrors(resError) {
    // Here we need to decide which of the response errors should be returned back to the client and which one
    // of those should result in a server error
    var triageErrorResponse = resError.body;
    switch (resError.statusCode) {
      case 400:
        return new ValidationError(triageErrorResponse.message);
      case 401:
        return new AuthorizationError(triageErrorResponse.message);
      default:
        if (
          !AppUtil.isUndefined(triageErrorResponse) &&
          !AppUtil.isUndefined(triageErrorResponse.message) &&
          !AppUtil.isUndefined(triageErrorResponse.exception)
        ) {
          return new RuntimeError(triageErrorResponse.message, triageErrorResponse.exception);
        }
        return new RuntimeError('Some unexpected error has happened. Error: ' + JSON.stringify(resError));
    }
  },
  /**
   * This will handle the Triage specific response errors
   *
   * @param {object} resError - The response error object
   *
   * @author Ryno Hartzer <ryno.hartzer@a24group.com>
   * @since  30 September 2016
   *
   * @return {Error} Return error that will be shown to user
   */
  handleTriageGetListResponseErrors: function handleTriageGetListResponseErrors(resError) {
    if (resError.statusCode == 404 && !AppUtil.isUndefined(resError) && !AppUtil.isUndefined(resError.body)) {
      var triageErrorResponse = resError.body;
      return new ResourceNotFoundError(
        triageErrorResponse.message,
        triageErrorResponse.exception_message
      );
    }
    return this.handleGetListResponseErrors(resError);
  }
};
