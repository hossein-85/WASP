'use strict';

var util = require('util');

/**
 * The Resource Not Found Error module
 *
 * @author Hadi Shayesteh <Hadishayesteh@gmail.com>
 * @since  14 Aug 2017
 *
 * @module ResourceNotFoundError
 */
module.exports = function AuthorizationError(message) {
  Error.call(this);

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = new Error().stack;
  }

  this.name = this.constructor.name;
  this.message = message;
  this.status = 401;
};

util.inherits(module.exports, Error);
