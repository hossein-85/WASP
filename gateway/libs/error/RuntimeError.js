'use strict';

var util = require('util');

/**
 * The Runtime Error module
 *
 * @author Hossein Shayesteh <hossein.shayesteh@a24group.com>
 * @since  12 September 2016
 *
 * @module RuntimeError
 */
module.exports = function RuntimeError(message, exception) {
  Error.call(this);

  if (exception) {
    this.exception = exception;
  } else if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.exception = new Error().stack;
  }

  this.name = this.constructor.name;
  this.message = message;
  this.status = 500;
};

util.inherits(module.exports, Error);
