'use strict';

/**
 * The TestUtil module
 *
 * @author Hadi Shayesteh <Hadishayesteh@gmail.com>
 * @since  14 Aug 2017
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
   * @author Hadi Shayesteh <Hadishayesteh@gmail.com>
   * @since  14 Aug 2017
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