'use strict';
/* jshint esversion: 6 */
/* jshint node: true */

class Delta {
    constructor(removed, added) {
        this.removed = JSON.parse(JSON.stringify(removed));
        this.added = JSON.parse(JSON.stringify(added));
    }
}

exports.Delta = Delta;