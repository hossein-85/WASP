'use strict';

var url = require('url');
var NoteService = require('../services/NoteService');

/**
 * The Note controller module
 *
 * @module Device
 */
module.exports = {

  /**
   * Calls the corresponding service layer method to create a note
   *
   * @param {ClientRequest} request - The http request object
   * @param {IncomingMessage} response - The http response object
   * @param {function} next The callback used to pass control to the next action/middleware
   */
  createNote: function createNote(request, response, next) {
    NoteService.createNote(request.swagger.params, response, next);
  }
};