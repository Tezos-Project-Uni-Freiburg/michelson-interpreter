class State {
    constructor(account, address, amount, entrypoint, gas_limit, id, timestamp) {
        this.account = account;
        this.address = address;
        this.amount = amount;
        this.entrypoint = entrypoint;
        this.gas_limit = gas_limit;
        this.id = id;
        this.timestamp = timestamp;
    }
}

export default { State };