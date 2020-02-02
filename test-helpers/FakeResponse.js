class FakeResponse {
    constructor() {
        this._lastSent = null;
        this._set = []
    }

    async send(anything) {
        this._lastSent = anything;
    }

    async set(object) {
        this._set.push(object);
    }

    lastSentResponse() {
        return this._lastSent;
    }
}

module.exports = FakeResponse;