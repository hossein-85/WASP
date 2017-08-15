/**
 * Error returned if the user attempts to create a note with a title that already exists
 *
 * @type {string}
 */
const TITLE_ALREADY_EXISTS = 'TITLE_ALREADY_EXISTS';

/**
 * Error returned if the user specifies a note id that does not exist
 *
 * @type {string}
 */
const NOTE_WAS_NOT_FOUND = 'NOTE_WAS_NOT_FOUND';

/**
 * Module used to keep the validation error codes
 *
 * @author Hadi Shayesteh <Hadishayesteh@gmail.com>
 * @since  14 Aug 2017
 *
 * @module ErrorCodes
 */
module.exports = {
  TITLE_ALREADY_EXISTS: TITLE_ALREADY_EXISTS,
  NOTE_WAS_NOT_FOUND: NOTE_WAS_NOT_FOUND
};