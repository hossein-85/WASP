'use strict';

var startDate = new Date();

/**
 * Gets the system status
 *
 * @param {object} args - The request arguments passed in from the controller
 * @param {IncomingMessage} response - The http response object
 * @param {function} next - The callback used to pass control to the next action/middleware
 *
 * @author Willem Albrecht <willem.albrecht@a24group.com>
 * @since  02 June 2016
 */
exports.getSystemStatus = function(args, res, next) {
  var now = new Date();
  var objStatus = {
    "up_time" : now - startDate
  };

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(objStatus));

}
