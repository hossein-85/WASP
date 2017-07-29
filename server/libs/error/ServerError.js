'use strict';

var util = require('util');

/**
 * The Server Error module
 *
 * @author Hossein Shayesteh <hossein.shayesteh@a24group.com>
 * @since  14 May 2016
 *
 * @module ServerError
 */
module.exports = function ServerError(err) {
  Error.call(this);
  this.code = 'INTERNAL_SERVER_ERROR';
  var errorMessage = 'Server encountered an internal error and was unable to complete your request';

  if (err.message !== undefined) {
    errorMessage = err.message;
  }
  this.message = errorMessage;

  if (err.stack !== undefined) {
    this.stack = err.stack;
  }
};

util.inherits(module.exports, Error);
