'use strict';
/* jshint esversion: 6 */
/* jshint node: true */

const { Data } = require("./types/Data.cjs");

function initialize(parameter, storage) {
    return new Data("pair", [new Data(parameter.prim, parameter.args, parameter.annots), new Data(storage.prim, storage.args, storage.annots)], []);
}

exports.initialize = initialize;