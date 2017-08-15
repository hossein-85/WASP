var amqp = require('amqplib/callback_api');
var config = require('config');
var ZSchema = require('z-schema');
var validator = new ZSchema();
var Logging = new require('./Logging');
var Monitor = require('./Monitor');

function AmqpConsumer () {}

/**
 * This will subscribe to all queues and listen for any messages in these queues.
 *
 * @param {object} amqpConfig - The amqp configuration.
 *
 * @author Hadi Shayesteh <Hadishayesteh@gmail.com>
 * @since  14 Aug 2017
 */
AmqpConsumer.consumeAmqpMessages = function consumeAmqpMessages(amqpConfig) {
  amqp.connect(amqpConfig.connection.details.host, amqpConfig.connection.options, function(err, conn) {
    if (err) {
      Logging.logAction(
        Logging.logLevels.ERROR,
        'There is a problem connecting to amqp when trying to consume.',
        err
      );

      // Here we will exit the process as there is a problem connecting to the amqp server
      // this is to allow forever to start the script again.
      return process.exit(1);
    }

    var arrQueues = getQueues(amqpConfig);

    for (var i = 0; i < arrQueues.length; i++) {
      subscribeToQueue(conn, arrQueues[i]);
    }
  });
};

/**
 * This will subscribe to the given queue.
 *
 * @author Hadi Shayesteh <Hadishayesteh@gmail.com>
 * @since  14 Aug 2017
 *
 * @param conn - The connection to subscribe with.
 * @param givenQueue - The queue to subscribe to.
 */
function subscribeToQueue(conn, givenQueue) {
  conn.createChannel(function(err, ch) {
    ch.assertQueue(givenQueue.name, givenQueue.publish_options, function(err, q) {
      if (err) {
        return;
      }
      ch.prefetch(givenQueue.consumption_options.prefetchCount);
      ch.consume(q.queue, function(msg) {

        var stringMessage = msg.content.toString('utf8');
        var jsonMessage = JSON.parse(stringMessage);
        var validationErrors = validateMessageStructure(jsonMessage);

        if (validationErrors != null) {
          var logMessage = {
            'errors' : validationErrors,
            'amqp_message' : jsonMessage
          };
          Logging.logAction(
            Logging.logLevels.ERROR,
            'Incorrect message structure given to consumer for queue: ' + givenQueue.name,
            logMessage
          );

          // for now we will just acknowledge the message.
          ch.ack(msg);
        } else {
          // handler has the same name as the Queue
          // We require the handler dynamically
          try {
            var handler = require('../handlers/amqp/' + givenQueue.name);
          } catch (exception) {
            Logging.logAction(
              Logging.logLevels.ERROR,
              'Could not find a handler for queue: ' + givenQueue.name,
              exception.message
            );

            ch.ack(msg);
            return;
          }

          var bgTrans = Monitor.createBackgroundTransaction('consume/message/' + givenQueue.name, function () {
            // Call the method to handle the transaction.
            handler.handleMessage(jsonMessage, function handleMsgCallback(status) {
              if (status) {
                Logging.logAction(
                  Logging.logLevels.INFO,
                  'consumed message from queue: ' + givenQueue.name,
                  jsonMessage
                );
                ch.ack(msg);
              } else {
                Logging.logAction(
                  Logging.logLevels.ERROR,
                  'Failed to consumed the message from queue: ' + givenQueue.name,
                  jsonMessage
                );
                ch.reject(msg);
              }
              Monitor.endTransaction();
            });
          });
          
          bgTrans();

        }
      }, givenQueue.consumption_options);
    });
  });
}

module.exports = AmqpConsumer;

/**
 * This will validate that the message is in the expected format.
 *
 * @param {object} message - The message object to validate.
 *
 * @author Hadi Shayesteh <Hadishayesteh@gmail.com>
 * @since  14 Aug 2017
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
 * This will get all the queues as a flat array of queue objects as defined in the config.
 *
 * @param {object} amqpConfig - The amqp configuration.
 *
 * @author Hadi Shayesteh <Hadishayesteh@gmail.com>
 * @since  14 Aug 2017
 *
 * @return {Array} the array of queue objects
 */
function getQueues(amqpConfig) {
  var arrQueues = [];
  var givenExchanges = amqpConfig.exchanges;

  for (var i = 0; i < givenExchanges.length; i++) {
    var givenQueuesForExchange = givenExchanges[i].queues;
    for (var j = 0; j < givenQueuesForExchange.length; j++) {
      arrQueues.push(givenQueuesForExchange[j])
    }
  }

  return arrQueues;
}