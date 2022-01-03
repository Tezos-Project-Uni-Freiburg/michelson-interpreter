'use strict';
/* jshint esversion: 6 */
/* jshint node: true */

class Step {
    constructor(delta, instruction) {
        this.delta = JSON.parse(JSON.stringify(delta));
        this.instruction = JSON.parse(JSON.stringify(instruction));
    }
}

exports.Step = Step;