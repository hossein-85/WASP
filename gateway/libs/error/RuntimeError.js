'use strict';

var util = require('util');

/**
 * The Runtime Error module
 *
 * @author Hadi Shayesteh <Hadishayesteh@gmail.com>
 * @since  14 Aug 2017
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
