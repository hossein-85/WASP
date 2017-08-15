var winston = require('winston');
var WinstonGraylog2 = require('winston-graylog2');
var config = require('config');

/**
 * An instance of the logger object
 *
 * @var {winston.Logger} logger
 */
var logger = null;

/**
 * The Logging module
 *
 * @author Hadi Shayesteh <Hadishayesteh@gmail.com>
 * @since  14 Aug 2017
 *
 * @module Logging
 */
module.exports = {
  logLevels: {
    INFO: 'info',
    CRITICAL: 'crit',
    ERROR: 'error',
    WARN: 'warn',
    NOTICE: 'notice',
    DEBUG: 'debug',
    EMERGENCY: 'emerg',
    ALERT: 'alert'
  },

  /**
   * Logs a given message using the specified transport type
   *
   * @param {string} logLevel - The log level
   * @param {string} logMessage - The log message
   * @param {object} extraFieldsObject - The extra information that needs to be logged
   *
   * @author Hadi Shayesteh <Hadishayesteh@gmail.com>
   * @since  14 Aug 2017
   */
  logAction: function (logLevel, logMessage, extraFieldsObject) {
    // This will create the empty array of transports which we will add to.
    var arrTransporters = [];

    if (config.logging.length !== 0) {
      // Here we will add logging based on the names given.
      // With the correctly configured options.
      for (var i = 0; i < config.logging.length; i++) {
        if (config.logging[i].name == 'gelf') {
          arrTransporters.push(new (WinstonGraylog2)(config.logging[i]));
        }
        if (config.logging[i].name == 'file') {
          arrTransporters.push(new (winston.transports.File)(config.logging[i]));
        }
      }

      // Create the logger if it has not been created yet.
      if (logger == null) {
        logger = new (winston.Logger)({
          exitOnError: false,
          transports: arrTransporters
        });
      }
      
      // Log given message with log level and any given object.
      // This does not use the app util to prevent a circular dependency.
      if (!(typeof extraFieldsObject === 'undefined' || extraFieldsObject == undefined)) {
        logger.log(logLevel, logMessage, extraFieldsObject);
      } else {
        logger.log(logLevel, logMessage);
      }
    }

  }
};