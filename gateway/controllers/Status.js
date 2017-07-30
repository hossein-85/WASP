'use strict';

var url = require('url');
var Status = require('../services/StatusService');

/**
 * Calls the corresponding service layer method to get system status
 *
 * @param {ClientRequest} request - The http request object
 * @param {IncomingMessage} response - The http response object
 * @param {function} next The callback used to pass control to the next action/middleware
 *
 * @author Willem Albrecht <willem.albrecht@a24group.com>
 * @since  02 June 2016
 */
module.exports.getSystemStatus = function getSystemStatus (req, res, next) {
  Status.getSystemStatus(req.swagger.params, res, next);
};
