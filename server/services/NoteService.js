'use strict';

var Note = require('../models/note');
var ErrorCodes = require('../libs/error/ErrorCodes');
var ValidationError = require('../libs/error/ValidationError');
var AppUtil = require('../libs/AppUtil');
var Logging = require('../libs/Logging');
var config = require('config');

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
  createNote: function(args, response, next) {
    // Make sure that the no other note with the same title exist already
    var noteRequest = args.note.value;

    Note.findOne(
      {title: noteRequest.title},
      function noteFindOneCallback(err, note) {
        if (err) {
          next(err);
          return;
        }

        if (!AppUtil.isUndefined(note)) {
          var modelValidationError = new ValidationError(
            'Some validation errors occurred.',
            [
              {
                code: ErrorCodes.TITLE_ALREADY_EXISTS,
                message: 'A note with the title [' + noteRequest.title + '] already exists.',
                path: ['title']
              }
            ]
          );
          next(modelValidationError);
          return;
        }

        noteRequest.status = 'new';

        var noteEntity = new Note(noteRequest);

        Logging.logAction(
          Logging.logLevels.INFO,
          'Attempting to save a new note document'
        );

        noteEntity.save(
          function noteSaveCallback(err) {
            if (err) {
              next(err);
              return;
            }

            // we do not want to return this prop
            response.statusCode = 201;
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify(noteEntity));
          }
        );
      }
    );
  }
};