'use strict';
/* jshint esversion: 6 */
/* jshint node: true */

class State {
    constructor(gas_limit, amount, id, account, entrypoint, timestamp, address) {
        this.gas_limit = gas_limit;
        this.amount = amount;
        this.id = id;
        this.account = account;
        this.entrypoint = entrypoint;
        this.timestamp = timestamp;
        this.address = address;
    }
}

exports.State = State;