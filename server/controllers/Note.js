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
  },

  /**
   * Calls the corresponding service layer method to get all notes
   *
   * @param {ClientRequest} request - The http request object
   * @param {IncomingMessage} response - The http response object
   * @param {function} next The callback used to pass control to the next action/middleware
   */
  getAllNotes: function getAllNotes(request, response, next) {
    NoteService.getAllNotes(request.swagger.params, response, next);
  },

  /**
   * Calls the corresponding service layer method to delete a note
   *
   * @param {ClientRequest} request - The http request object
   * @param {IncomingMessage} response - The http response object
   * @param {function} next The callback used to pass control to the next action/middleware
   */
  deleteNote: function deleteNote(request, response, next) {
    NoteService.deleteNote(request.swagger.params, response, next);
  },

  /**
   * Calls the corresponding service layer method to get a single note
   *
   * @param {ClientRequest} request - The http request object
   * @param {IncomingMessage} response - The http response object
   * @param {function} next The callback used to pass control to the next action/middleware
   */
  getNote: function getNote(request, response, next) {
    NoteService.getNote(request.swagger.params, response, next);
  },

  /**
   * Calls the corresponding service layer method to update a note
   *
   * @param {ClientRequest} request - The http request object
   * @param {IncomingMessage} response - The http response object
   * @param {function} next The callback used to pass control to the next action/middleware
   */
  updateNote: function getNote(request, response, next) {
    NoteService.updateNote(request.swagger.params, response, next);
  }
};