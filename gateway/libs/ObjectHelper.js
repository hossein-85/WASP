'use strict';
/**
 * An instance of the object helper module
 *
 * @author Hadi Shayesteh <Hadishayesteh@gmail.com>
 * @since  14 Aug 2017
 *
 * @module ObjectHelper
 */
module.exports = {
  /**
   * Merges the properties of the second objects to the first one.
   *
   * It will overwrite values of the first object if the property already exist in the first one
   *
   * @param {object} objOne - The object to which the properties will be merged
   * @param {object} objTwo - The object from which the properties will be merged
   *
   * @author Hadi Shayesteh <Hadishayesteh@gmail.com>
   * @since  14 Aug 2017
   *
   * @returns {object} objOne a new object based on obj1 and obj2
   */
  mergeObjects: function mergeObjects(objOne, objTwo) {
    for (var propertyName in objTwo) {
      if (objTwo.hasOwnProperty(propertyName)) {
        objOne[propertyName] = objTwo[propertyName];
      }
    }
    return objOne;
  },

  /**
   * Merges the properties of the second objects to the first one.
   *
   * It will overwrite values of the first object if the property already exist in the first one
   *
   * @param {object} objOne - The object to which the properties will be merged
   * @param {object} objTwo - The object from which the properties will be merged
   *
   * @author Hadi Shayesteh <Hadishayesteh@gmail.com>
   * @since  14 Aug 2017
   *
   * @returns {object} objThree a new object based on obj1 and obj2
   */
  mergeObjectAndReturnResponse: function mergeObjectAndReturnResponse(objOne, objTwo){
    var objThree = {};

    for (var propertyName in objOne) {
      if (objOne.hasOwnProperty(propertyName)) {
        objThree[propertyName] = objOne[propertyName];
      }
    }

    for (var propertyNameTwo in objTwo) {
      if (objTwo.hasOwnProperty(propertyNameTwo)) {
        objThree[propertyNameTwo] = objTwo[propertyNameTwo];
      }
    }
    return objThree;
  }

};
