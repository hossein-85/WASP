'use strict';

/**
 * The TestUtil module
 *
 * @author Neil Nienaber <neil.nienaber@a24group.com>
 * @since  08 June 2016
 *
 * @module TestUtil
 */
module.exports = {

  /**
   * Will determine that the passed in range is within a partiuclar offset
   *
   * @param {string} iso_string_date the date as an iso string
   * @param {integer} range the range that should be considered should be bigger than 0, defaults to 60
   *
   * @author Neil Nienaber <neil.nienaber@a24group.com>
   * @since  08 June 2016
   */
  isWithinRange: function(iso_string_date, range) {
    if (!range) {
      range = 60;
    }
    var date = new Date(iso_string_date);
    var currentDate = Date.now();
    var diff = currentDate - date.getTime();
    return (diff < range)
  }

}