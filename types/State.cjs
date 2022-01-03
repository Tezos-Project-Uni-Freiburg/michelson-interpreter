'use strict';
/* jshint esversion: 6 */
/* jshint node: true */

class State {
    constructor(parameter, gas_limit, amount, id, account, entrypoint, timestamp, address, storage) {
        this.parameter = JSON.parse(JSON.stringify(parameter));
        this.gas_limit = gas_limit;
        this.amount = amount;
        this.id = id;
        this.account = account;
        this.entrypoint = entrypoint;
        this.timestamp = timestamp;
        this.address = address;
        this.storage = JSON.parse(JSON.stringify(storage));
    }
}

exports.State = State;