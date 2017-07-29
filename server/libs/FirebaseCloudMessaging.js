'use strict';

var https = require('https');
var AppUtil = require('../libs/AppUtil');
var config = require('config');

/**
 * The Firebase Cloud Messaging module
 *
 * @module FirebaseCloudMessaging
 */
module.exports = {

  /**
   * Attempts to submit a notification message to FCM
   *
   * @param {Object} fcmOptions - The option object that will be sent to the FCM
   * @param {Object} payload - The FCM service call's payload
   * @param {function} callback - The callback that will handle the result of the service call
   */
  send: function (fcmOptions, payload, callback) {
    var didTimeout = false;
    var request = https.request(fcmOptions, function httpRequestCallback(response) {
      var data = '';
      response.on('data', function responseOnDataCallback(chunk) {
        data += chunk;
      });
      response.on('end', function responseOnEndCallback() {
        var fcmResponse = {
          registration_ids : payload.registration_ids,
          response: {
            statusCode: response.statusCode,
            headers: {
              'content-type': response.headers['content-type']
            }
          },
          data: data
        };
        callback(null, fcmResponse);
      });

    });

    request.setTimeout(config.request_timeout);
    
    request.on('timeout', function () {
      // Set the flag for when there is a timeout.
      didTimeout = true;
      // Abort the request due to having reached the timeout limit.
      request.abort();
    });

    request.on('error', function requestOnErrorCallback(error) {
      var message = 'RequestError';

      // Check if there was a timeout.
      if (didTimeout) {
        message = 'TimeoutError';
        // Reset the flag.
        didTimeout = false;
      } else {
        if (!AppUtil.isUndefined(error.message)) {
          message = error.message;
        }
      }
      var errorObject = {
        message: message,
        statusCode: -1
      };

      callback(errorObject, null);
    });
    request.end(JSON.stringify(payload));
  },

  /**
   * This will transform the response received from FCM into a format that is understandable by our app
   *
   * @param {Object} fcmResponse - The fcm response
   * @param {function} callback - The callback to handle the result of transformation
   * 
   * @author Hossein Shayesteh <hossein.shayesteh@a24group.com>
   * @since  01 June 2016
   */
  transformFCMResponse: function (fcmResponse, callback) {
    var error = {};
    var response = fcmResponse.response;
    var arrRegIds = fcmResponse.registration_ids;
    var data = fcmResponse.data;

    if (response.statusCode === 200) {
      // now we have to figure out if there are any failures
      // FCM is very inconsistent in this regard, there are certain responses that have 200 code but is return as
      // text/plain. So we should check that first
      if (response.headers['content-type'].indexOf('text/plain') >= 0) {
        data = data.substring(data.indexOf('Error=') + 6, data.length);
        error.message = data;
        // Even though the status code was 200, the errors that we get back as plain text are usually validation error
        // so in order to make error handling easier in our app, we change this to a 400
        error.statusCode = 400;
        callback(error, null, null);
      } else if (response.headers['content-type'].indexOf('application/json') >= 0) {
        try {
          data = JSON.parse(data);
        } catch (err) {
          error.message = 'InvalidJSONFormat';
          error.statusCode = 400;
          return callback(error, null, null);
        }

        var arrDeviceStatus = [];

        // This might causes problems if FCM changes their response structure but we have to some how ensure that we get
        // the correct structure back
        if (AppUtil.isUndefined(data.failure) || AppUtil.isUndefined(data.success) || AppUtil.isUndefined(data.results)) {
          error.message = 'UnknownResponseFormat';
          error.statusCode = 400;
          callback(error, null, null);
        } else {
          for (var i = 0; i < data.results.length; i++) {
            var deviceStatus = {};
            var result = data.results[i];
            if (result.hasOwnProperty('error')) {
              deviceStatus.status = 'error';
              deviceStatus.registration_id = arrRegIds[i];
              deviceStatus.message = result.error;
              arrDeviceStatus.push(deviceStatus);
            } else if (result.hasOwnProperty('message_id')) {
              deviceStatus.status = 'sent';
              deviceStatus.registration_id = arrRegIds[i];
              deviceStatus.message_id = result.message_id;
              arrDeviceStatus.push(deviceStatus);
            } else {
              deviceStatus.status = 'unknown';
              deviceStatus.registration_id = arrRegIds[i];
              deviceStatus.message = 'UnknownResponseFormat';
              arrDeviceStatus.push(deviceStatus);
            }
          }
          callback(null, arrDeviceStatus, data.multicast_id);
        }
      } else {
        error.message = 'UnknownContentType';
        error.statusCode = 400;
        callback(error, null, null);
      }
    } else {
      error.message = data;
      error.statusCode = response.statusCode;
      callback(error, null, null);
    }
  }
};
