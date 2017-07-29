var ZSchema = require('z-schema');
var validator = new ZSchema();
var Logging = require('./Logging');
var async = require('async');
var amqplib = require('amqplib/callback_api');

var amqpConnection = null;
var amqpChannel = {};

module.exports = {

  /**
   * Sends a given message to the given exchange.
   * This will also bind all queues to the given exchange before publishing.
   *
   * This will also validate the structure of the message.
   *
   * @param {object} amqpConfig - The amqp configuration which is [config.amqp]
   * @param {string} exchangeName - The name of the exchange to publish to.
   * @param {object} message - The message that needs to be sent.
   *
   * @author Gregory Smith <greg.smith@a24group.com>
   * @since  19 May 2016
   *
   * @return {boolean|object} - the object containing error or a true that validation has passed.
   */
  publishAmqpMessage : function (amqpConfig, exchangeName, message) {
    var configValidationErrors = validateConfigStructure(amqpConfig);

    // Make sure the structure of the config conforms to what we expect.
    if (configValidationErrors != null) {
      return configValidationErrors;
    }

    var validationErrors = validateMessageStructure(message);
    // Before carrying on make sure that the structure of the message is correct.
    if (validationErrors != null) {
      var logMessage = {
        'amqp_message' : message,
        'error' : validationErrors
      };

      Logging.logAction(Logging.logLevels.ERROR, 'Incorrect message structure', logMessage);

      return validationErrors;
    }

    if (amqpConnection == null) {
      // We are currently setting the `rejectUnauthorized` due to https://github.com/A24Group/Triage/issues/9598
      amqplib.connect(amqpConfig.connection.details.host, amqpConfig.connection.options, function(err, conn) {
        if (err) {
          Logging.logAction(
            Logging.logLevels.ERROR,
            'There is a problem connecting to amqp when trying to publish.',
            err
          );
          return;
        }
        
        amqpConnection = conn;

        conn.createChannel(function(err, channel) {
          amqpChannel[exchangeName] = channel;
          publishToExchange(amqpConfig, exchangeName, message, channel);
        });
      });
    } else if (amqpChannel[exchangeName]) {
      publishToExchange(amqpConfig, exchangeName, message, amqpChannel[exchangeName]);
    } else {
      amqpConnection.createChannel(function(err, channel) {
        amqpChannel[exchangeName] = channel;
        publishToExchange(amqpConfig, exchangeName, message, amqpChannel[exchangeName]);
      });
    }

    return true;
  }
};

/**
 * This will publish a message to the given exchange.
 * This will also bind all the queues for an exchange.
 *
 * @param amqpConfig - The configuration for amqp.
 * @param exchangeName - The exchange to publish to.
 * @param message - The message that will need to be published.
 * @param channel - The channel that will need to be used to publish.
 *
 * @author Gregory Smith <greg.smith@a24group.com>
 * @since  06 July 2016
 */
function publishToExchange(amqpConfig, exchangeName, message, channel) {
  for (var i = 0; i < amqpConfig.exchanges.length; i++) {
    var givenExchange = amqpConfig.exchanges[i];
    // Here we perform the queue name check.
    if (givenExchange.name == exchangeName) {
      channel.assertExchange(givenExchange.name, givenExchange.type, givenExchange.options);

      async.forEach(givenExchange.queues, function (givenQueue, callback) {
        var exchange  = givenExchange.name;
        channel.assertQueue(givenQueue.name, {exclusive: false}, function(err, q) {
          channel.bindQueue(q.queue, exchange, givenQueue.routing_key);
          callback();
        });
      }, function (err) {
        if (err) {
          var logObject = {
            'error': err,
            'amqp_message': message
          };

          Logging.logAction(
            Logging.logLevels.ERROR,
            'There was an unexpected error when binding queues to exchange: ' + givenExchange.name,
            logObject
          );
          return;
        }

        Logging.logAction(
          Logging.logLevels.INFO,
          'sent message to exchange: ' + givenExchange.name,
          message
        );

        channel.publish(exchangeName, givenExchange.routing_key, new Buffer(JSON.stringify(message)));
      });
    }
  }
}

/**
 * This will validate that the message is in the expected format.
 *
 * @param {object} message - The message object to validate.
 *
 * @author Gregory Smith <greg.smith@a24group.com>
 * @since  19 May 2016
 *
 * @return {object|null} will return null when there are no errors or will return
 */
function validateMessageStructure(message) {
  var schema = {
    'type' : 'object',
    'required' : [
      'dataArea',
      'applicationArea'
    ],
    'properties' : {
      'dataArea': {
        'type' : 'object',
        'required' : [
          'process'
        ],
        'properties' : {
          'process' : {
            'type' : 'object',
            'required' : [
              'action'
            ],
            'properties' : {
              'action' : {
                'type' : 'string',
                'description' : 'Details what caused the message production',
                'minLength' : 3
              }
            }
          }
        }
      },
      'applicationArea' : {
        'type' : 'object',
        'required' : ['dateCreated']
      }
    }
  };

  validator.validate(message, schema);
  return validator.getLastError();
}

/**
 * This will validate that the config is in the expected format, this is to ensure that we get validate configurations.
 *
 * @param {object} config - the config to validate.
 *
 * @author Gregory Smith <greg.smith@a24group.com>
 * @since  20 May 2016
 *
 * @returns {object|null} - will return null when there are no errors or will return
 */
function validateConfigStructure(config) {
  var schema = {
    'type' : 'object',
    'required' : [
      'connection',
      'exchanges'
    ],
    'properties' : {
      'connection': {
        'type' : 'object',
        'required' : [
          'details',
          'options'
        ],
        'properties' : {
          'details' : {
            'type' : 'object',
            'required' : [
              'host'
            ],
            'properties' : {
              'host' : {
                'type' : 'string',
                'description' : 'The host to which we will make a connection',
                'minLength' : 3
              }
            }
          }
        }
      },
      'exchanges' : {
        'type' : 'array',
        'items' : {
          'type' : 'object',
          'required' : ['name', 'options', 'queues'],
          'properties' : {
            'name' : {
              'type' : 'string',
              'description' : 'The name of the exchange',
              'minLength' : 1
            },
            'queues' : {
              'type' : 'array',
              'items' : {
                'type' : 'object',
                'required' : ['name', 'consumption_options', 'publish_options'],
                'properties' : {
                  'name' : {
                    'type' : 'string',
                    'description' : 'name of the queue',
                    'minLength' : 1
                  }
                }
              }
            }
          }
        }
      }
    }
  };

  validator.validate(config, schema);
  return validator.getLastError();
}