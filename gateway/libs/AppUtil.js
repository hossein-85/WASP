var ZSchema = require('z-schema');
var validator = new ZSchema();
var Logging = require('./Logging');

/**
 * Created by hossein on 2016/05/17.
 */
module.exports = {
  isUndefined: function (data) {
    return typeof data === 'undefined' || data == undefined || data === null;
  },

  /**
   * This checks if the given array is empty or not.
   * 
   * It is considered empty if any of the below checks are true or if it is null
   *
   * @param {Array} data - The variable to check.
   *
   * @author Hadi Shayesteh <Hadishayesteh@gmail.com>
   * @since  14 Aug 2017
   *
   * @return {boolean} will return true of the given array is empty otherwise false
   */
  isArrayEmpty: function (data) {
    return this.isUndefined(data) || data.length === 0;
  },
  /**
   * This will what kind of error was given and handle it in an appropriate way.
   *
   * @param {object} err - The error that occurred for the find.
   * @param {function} callback - The callback.
   *
   * @author Hadi Shayesteh <Hadishayesteh@gmail.com>
   * @since  14 Aug 2017
   */
  handleMongooseFindError: function(err, callback)  {
    if (err.name == 'CastError') {
      Logging.logAction(
        Logging.logLevels.ERROR,
        'There was a cast error when trying to find a record',
        err
      );
      callback(true);
      return;
    }

    Logging.logAction(
      Logging.logLevels.ERROR,
      'There was an error when attempting a find',
      err
    );

    callback(false);
  },
  /**
   * This will validate that the message is in the expected format.
   *
   * @param {object} object - The message object to validate.
   * @param {object} schema - The schema against which the object will be validated
   *
   * @author Hadi Shayesteh <Hadishayesteh@gmail.com>
   * @since  14 Aug 2017
   *
   * @return {object|null} will return null when there are no errors or will return
   */
  validateObjectStructure: function (object, schema) {
    validator.validate(object, schema);
    return validator.getLastError();
  }
  
};
