'use strict';

var Note = require('../models/note');
var ErrorCodes = require('../libs/error/ErrorCodes');
var ValidationError = require('../libs/error/ValidationError');
var AppUtil = require('../libs/AppUtil');
var Logging = require('../libs/Logging');
var config = require('config');
var async = require('async');
var ServiceDriver = require('../libs/ServiceDriver');
var _ = require('lodash');

var timeTracker = new TimeTracker();

/**
 * The Note Service module
 */
module.exports = {
  
  /**
   * Creates note
   *
   * @param {object} args - The request arguments passed in from the controller
   * @param {IncomingMessage} response - The http response object
   * @param {function} next - The callback used to pass control to the next action/middleware
   */
  createNote: function(args, res, next) {

    _getAvailableHost(function(err, response){

      if (err) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(err));
      }

      return _makePOST(response, "/v1/note", args.note.value, function(err, response) {
        if (err) {
          return next(err);
        }
        res.statusCode = response.statusCode;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(response.body));
      });
    });

  },
  
  /**
   * Returns all notes
   *
   * @param {object} args - The request arguments passed in from the controller
   * @param {IncomingMessage} response - The http response object
   * @param {function} next - The callback used to pass control to the next action/middleware
   */
  getAllNotes: function(args, res, next) {

    _getAvailableHost(function(err, response){

      if (err) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(err));
      }

      return _makeGET(response, "/v1/note", function(err, response) {
        if (err) {
          return next(err);
        }
        res.statusCode = response.statusCode;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(response.body));
      });
    });
  }
};

function _getAvailableHost(callback) {
  var firstNodePort = "3200";
  var secondNodePort = "3300";

  async.parallel(
    [
      async.apply(_makeGET, firstNodePort, "/v1/status"),
      async.apply(_makeGET, secondNodePort, "/v1/status")
    ],
    function finalCallBack(err, results) {
      if (!AppUtil.isUndefined(err)) {
        return next(err);
      }

      var nodes = [];

      var firstNodeResponse = results[0];
      var secondNodeResponse = results[1];

      var firstNodeDuration = timeTracker.timeEnd(firstNodePort);
      var secondNodeDuration = timeTracker.timeEnd(secondNodePort);

      if (firstNodeResponse.statusCode === 200) {
        nodes.push({
          duration: firstNodeDuration,
          port: firstNodePort
        });
      }

      if (secondNodeResponse.statusCode === 200) {
        nodes.push({
          duration: secondNodeDuration,
          port: secondNodePort
        });
      }

      var sortedNodes = _.sortBy(nodes, function(a) { return a.duration;});

      if (sortedNodes.length !== 0) {
        return callback(null, sortedNodes[0].port);
      } else {
        return callback({result: 'No available host was found'}, null);
      }

    });
}

function _makeGET(port, requestPath, callback) {

  timeTracker.time(port);

  var timeOut = 2000;
  var headers =  {
    "Content-Type": "application/json",
    "Accept": "application/json"
  };

  var serviceDriver = new ServiceDriver(
    port,
    "127.0.0.1",
    "http"
  );

  serviceDriver.setMethod('GET');
  serviceDriver.setPath(requestPath);
  serviceDriver.setHeader(headers);
  serviceDriver.setTimeOut(timeOut);

  return serviceDriver.makeBasicCall(_handleAndReturnOriginalResponse, callback);
}

function _makePOST(port, requestPath, payload, callback) {

  timeTracker.time(port);

  var timeOut = 2000;
  var headers =  {
    "Content-Type": "application/json",
    "Accept": "application/json"
  };

  var serviceDriver = new ServiceDriver(
    port,
    "127.0.0.1",
    "http"
  );

  serviceDriver.setMethod('POST');
  serviceDriver.setPath(requestPath);
  serviceDriver.setHeader(headers);
  serviceDriver.setTimeOut(timeOut);

  return serviceDriver.post(payload, _handleAndReturnOriginalResponse, callback);
}

function _handleAndReturnOriginalResponse(response, responseData, callback) {
  var getResponse = {
    statusCode: response.statusCode,
    body: responseData,
    headers: response.headers
  };

  return callback(null, getResponse);
}

function TimeTracker() {

  var that = this;
  this.times = {};

  this.time = function(label) {
    that.times[label] = Date.now();
  };

  this.timeEnd = function(label) {
    var time = that.times[label];
    if (!time) {
      throw new Error('No such label: ' + label);
    }
    var duration = Date.now() - time;
    console.log('%s: %dms', label, duration);
    return duration;
  };
}