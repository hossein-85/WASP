'use strict';

var util = require('util');

/**
 * The Validation Error module
 *
 * @author Hossein Shayesteh <hossein.shayesteh@a24group.com>
 * @since  14 May 2016
 *
 * @module ValidationError
 */
module.exports = function ValidationError(message, errors) {
  Error.call(this);

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = new Error().stack;
  }
  
  this.name = this.constructor.name;
  this.code = 'MODEL_VALIDATION_FAILED';
  this.message = message;
  if (errors !== undefined) {
    this.results = {'errors' : errors};
  }
  this.status = 400;
};

util.inherits(module.exports, Error);
