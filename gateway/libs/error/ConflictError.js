'use strict';

var util = require('util');

/**
 * The Conflict Error module
 *
 * @author Hossein Shayesteh <hossein.shayesteh@a24group.com>
 * @since  14 May 2016
 *
 * @module ConflictError
 */
module.exports = function ConflictError(message) {
  Error.call(this);

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = new Error().stack;
  }
  this.name = this.constructor.name;
  this.code = 'CONFLICT_ERROR';
  this.message = message;
  this.status = 409;
};

util.inherits(module.exports, Error);
