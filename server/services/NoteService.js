'use strict';

var Note = require('../models/note');
var ErrorCodes = require('../libs/error/ErrorCodes');
var ValidationError = require('../libs/error/ValidationError');
var ResourceNotFoundError = require('../libs/error/ResourceNotFoundError');
var AppUtil = require('../libs/AppUtil');
var Logging = require('../libs/Logging');
var config = require('config');
var _ = require('lodash');

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
          return next(modelValidationError);
        }

        noteRequest.status = 'new';

        _.forEach(noteRequest.items, function(item){
          item.status = 'new';
        });
        
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
  },
  
  /**
   * Deletes note
   *
   * @param {object} args - The request arguments passed in from the controller
   * @param {IncomingMessage} response - The http response object
   * @param {function} next - The callback used to pass control to the next action/middleware
   */
  deleteNote: function(args, response, next) {
    // Make sure that the no other note with the same title exist already

    Note.findById(args.id.value, function noteFindOneCallback(err, note) {
        if (err) {
          return next(err);
        }

        if (AppUtil.isUndefined(note)) {
          var modelValidationError = new ValidationError(
            'Some validation errors occurred.',
            [
              {
                code: ErrorCodes.NOTE_WAS_NOT_FOUND,
                message: 'A note with the id [' + args.id.value + '] could not be found.',
                path: ['id']
              }
            ]
          );
          return next(modelValidationError);
        }

        Logging.logAction(
          Logging.logLevels.INFO,
          'Attempting to remove a note document'
        );

        note.remove(
          function noteRemoveCallback(err) {
            if (err) {
              return next(err);
            }

            // we do not want to return this prop
            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify(note));
          }
        );
      }
    );
  },
  
  /**
   * Returns a note
   *
   * @param {object} args - The request arguments passed in from the controller
   * @param {IncomingMessage} response - The http response object
   * @param {function} next - The callback used to pass control to the next action/middleware
   */
  getNote: function(args, response, next) {

    Logging.logAction(
      Logging.logLevels.INFO,
      'Attempting to get a note document'
    );

    Note.findById(args.id.value, function noteFindOneCallback(err, note) {
        if (err) {
          return next(err);
        }

        if (AppUtil.isUndefined(note)) {
          var notFoundError = new ResourceNotFoundError(
            'Resource not found.',
            'No note with id [' + args.id.value + '] could be found'
          );
          return next(notFoundError);
        }

      // we do not want to return this prop
      response.statusCode = 200;
      response.setHeader('Content-Type', 'application/json');
      response.end(JSON.stringify(note));

      }
    );
  },

  /**
   * Returns a note
   *
   * @param {object} args - The request arguments passed in from the controller
   * @param {IncomingMessage} response - The http response object
   * @param {function} next - The callback used to pass control to the next action/middleware
   */
  updateNote: function(args, response, next) {

    var noteRequest = args.note.value;

    Note.findById(args.id.value, function noteFindOneCallback(err, note) {
        if (err) {
          return next(err);
        }

        if (AppUtil.isUndefined(note)) {
          var notFoundError = new ResourceNotFoundError(
            'Resource not found.',
            'No note with id [' + args.id.value + '] could be found'
          );
          return next(notFoundError);
        }

      // TODO consider doing this in parallel
      Note.findOne({ title: noteRequest.title }, function noteFindOneCallback(err, noteTitleCheck) {
          if (err) {
            next(err);
            return;
          }

          if (!AppUtil.isUndefined(noteTitleCheck) && (String(note._id) != String(noteTitleCheck._id))) {
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
            return next(modelValidationError);
          }

          Logging.logAction(
            Logging.logLevels.INFO,
            'Attempting to update a note document'
          );

          // set the updated properties, mongoose does not behave correctly if you pass a model directly
          var updatedProperties = {
            title: noteRequest.title,
            bgColor: noteRequest.bgColor,
            items: noteRequest.items
          };

          Note.update( {_id : note._id}, updatedProperties, function noteUpdateCallback(err) {
              if (err) {
                return next(err);
              }

              response.statusCode = 200;
              response.setHeader('Content-Type', 'application/json');

              note.title = noteRequest.title;
              note.bgColor = noteRequest.bgColor;
              note.items = noteRequest.items;
              note.updatedAt = Date.Now;

              return response.end(JSON.stringify(note));
            }
          );
        });
      }
    );
  },

  /**
   * Returns all notes
   *
   * @param {object} args - The request arguments passed in from the controller
   * @param {IncomingMessage} res - The http response object
   * @param {function} next - The callback used to pass control to the next action/middleware
   */
  getAllNotes: function(args, res, next) {

    Logging.logAction(
      Logging.logLevels.INFO,
      'Attempting to retrieve all notes'
    );

    Note.find(
      {},
      function noteFindCallback(err, notes) {
        if (err) {
          next(err);
          return;
        }

        // If the array is empty we need to return a 204 response.
        if (AppUtil.isArrayEmpty(notes)) {
          res.statusCode = 204;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('X-Result-Count', 0);
          res.end(null);
        } else {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('X-Result-Count', notes.length);
          res.end(JSON.stringify(notes));
        }
      }
    );
  }
};