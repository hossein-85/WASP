'use strict';

var util = require('util');

/**
 * The Resource Not Found Error module
 *
 * @author Marylene Sawyer <marylene.sawyer@a24group.com>
 * @since  09 September 2016
 *
 * @module ResourceNotFoundError
 */
module.exports = function ResourceNotFound(message, exceptionMessage) {
  Error.call(this);

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = new Error().stack;
  }

  this.name = this.constructor.name;
  this.message = message;
  this.exception_message = exceptionMessage;
  this.status = 404;
};

util.inherits(module.exports, Error);
