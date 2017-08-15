'use strict';

var Logging = require('../libs/Logging');
var MessageLock = require('../models/messageLock');
var AppUtil = require('./AppUtil');
var Logging = require('./Logging');

/**
 * The Message Locks module
 *
 * @author Hadi Shayesteh <Hadishayesteh@gmail.com>
 * @since  14 Aug 2017
 *
 * @module MessageLockUtil
 */
module.exports = {
  /**
   * This will create the lock in the lock collection.
   *
   * @param {String} lockType - The type of lock to create.
   * @param {Number} timeExpires - The time in seconds for when the lock expires.
   * @param {String} deviceId - The id of the device.
   * @param {String} messageId - The id of the message.
   * @param {function} callback - The callback.
   *
   * @author Hadi Shayesteh <Hadishayesteh@gmail.com>
   * @since  14 Aug 2017
   */
  addLock: function (lockType, timeExpires, deviceId, messageId, callback) {
    var messageLock = new MessageLock();

    messageLock.type = lockType;
    messageLock.timeout_period = timeExpires;

    if (!AppUtil.isUndefined(deviceId)) {
      messageLock.device_id = deviceId;
    }

    if (!AppUtil.isUndefined(messageId)) {
      messageLock.message_id = messageId;
    }
    messageLock.save(function (err) {
      callback(err);
    });
  },
  /**
   * Get locks for global, notification and device.
   *
   * Removes expired locks.
   * Returns null when there are locks that will prevent the message from being sent
   * Returns an empty object when there are no applicable locks
   * Returns a key value object of device ids and the current lock status
   *
   * @param {string} notificationId - The notification identifier.
   * @param {array} registeredDevices - The array of device ids.
   * @param {function} callback - The callback function that needs to be executed.
   *
   * @author Hadi Shayesteh <Hadishayesteh@gmail.com>
   * @since  14 Aug 2017
   */
  manageNotificationLocks: function (notificationId, registeredDevices, callback) {
    var query = {
      '$or' : [
        {
          'type' : 'global'
        },
        {
          'type' : 'message',
          'message_id' : notificationId
        },
        {
          'type' : 'device',
          'device_id' : {$in: registeredDevices}
        }
      ]
    };

    MessageLock.find(query, function(err, messageLocks) {

      if (err) {
        Logging.logAction(
          Logging.logLevels.ERROR,
          'There was an error retrieving the message locks for query: ' + JSON.stringify(query)
        );
        callback();
        return;
      }

      var deviceLockStatus = {};
      var globalDeviceLock = false;
      messageLocks.forEach(function (singleLock) {
        // Here is the check to see if the lock is expired or not.
        if (_hasLockExpired(singleLock)) {
          if (singleLock.type == 'device') {
            deviceLockStatus[singleLock.device_id] = 'expired';
          }
        } else {
          if (singleLock.type == 'global') {
            globalDeviceLock = true;
          } else if (singleLock.type == 'message' && singleLock.message_id == notificationId) {
            globalDeviceLock = true;
          } else if (singleLock.type == 'device') {
            deviceLockStatus[singleLock.device_id] = 'exists';
          } else {
            // we shouldn't do anything here, lets move on to the next iteration
          }
        }
      });

      // If there is a lock on the message, it means that we can't send a FCM message so return empty
      if (globalDeviceLock) {
        callback();
      } else {
        callback(deviceLockStatus);
      }
    });
  },

  /**
   * Remove all locks for the given query.
   *
   * This is a remove by query so make sure your query is correct. You CAN drop all data.
   *
   * @param {object} query - The query to match on
   * @param {function} callback - The callback as function(err)
   *
   * @author Hadi Shayesteh <Hadishayesteh@gmail.com>
   * @since  14 Aug 2017
   */
  removeLocks: function (query, callback) {
    // For more info see http://mongoosejs.com/docs/api.html#query_Query-remove
    MessageLock.remove(query, function(err) {
      if (err) {
        Logging.logAction(
          Logging.logLevels.ERROR,
          'Failed to delete lock data for query: ' + JSON.stringify(query),
          err.message
        );
        callback(err);
        return;
      }
      callback(null);
    });
  }
};

/**
 * Determine if a lock has already expired
 *
 * @param {MessageLock} singleLock The lock object
 *
 * @author Hadi Shayesteh <Hadishayesteh@gmail.com>
 * @since  14 Aug 2017
 *
 * @private
 *
 * @returns {boolean} Indicating if the lock has expired
 */
function _hasLockExpired(singleLock) {
  var dateCreated = singleLock.created_at;

  // The lock does not have the required info to determine if it is still valid, so remove it
  if (AppUtil.isUndefined(dateCreated)) {
    return true;
  }

  var currentDate = new Date();
  var expiryTime = dateCreated.getTime() + (singleLock.timeout_period * 1000);
  // Here is the check to see if the lock is expired or not.
  return currentDate.getTime() > expiryTime;
}
