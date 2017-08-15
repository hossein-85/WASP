'use strict';

var util = require('util');

/**
 * The EntityTooLarge Error module
 *
 * @author Hadi Shayesteh <Hadishayesteh@gmail.com>
 * @since  14 Aug 2017
 *
 * @module EntityTooLargeError
 */
module.exports = function EntityTooLargeError(message) {
    Error.call(this);

    if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
    } else {
        this.stack = new Error().stack;
    }
    this.name = this.constructor.name;
    this.code = 'ENTITY_TOO_LARGE';
    this.message = message;
    this.status = 413;
};

util.inherits(module.exports, Error);
