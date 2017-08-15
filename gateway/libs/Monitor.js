'use strict';

if (process.env.NODE_ENV === 'production') {
  var nr = require('newrelic');
}

/**
 * Used to abstract the monitoring framework and/or app.
 * Currently this is basically just a wrapper around the
 * new relic monitoring.
 *
 * @module Monitor
 */
module.exports = {

    /**
     * Creates monitoring for the back ground transaction.
     * Custom transactions must be ended manually by calling endTransaction().
     * Timing for custom transaction starts from when the returned wrapped
     * function is called until endTransaction() is called.
     *
     * @param {string} name - name is the name of the job. It should be pretty static, and not include job ids or anything very specific to that run of the job.
     * @param {string} group - group is optional, and allows you to group types of jobs together. This should follow similar rules as the name.
     * @param {function} callback - handle is a function that encompases your background job.
     *
     * @author Hadi Shayesteh <Hadishayesteh@gmail.com>
     * @since  14 Aug 2017
     *
     * @return {function} returns the wrapped function that will be used for the monitoring.
     */
    createBackgroundTransaction: function(name, group, callback) {
        if (nr !== undefined) {
            return nr.createBackgroundTransaction(name, group, callback);
        } else {
            if (callback === undefined && typeof group === 'function') {
                callback = group
            }

            return callback;
        }
    },

    /**
     * This takes no arguments and must be called to end any custom transaction.
     * It will detect what kind of transaction was active and end it.
     *
     * @author Hadi Shayesteh <Hadishayesteh@gmail.com>
     * @since  14 Aug 2017
     *
     * @return void
     */
    endTransaction: function() {
        if (nr !== undefined) {
            return nr.endTransaction();
        } else {
            return;
        }
    }

};