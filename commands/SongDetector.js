const apiKey = "e559e284cffb189e3b3ab07f0446e2b9"

class SongDetector {
    constructor() {
    };

    async execute() {
        return this.ok("ohnoes");
    };

    ok(value) { return { status: 200, body: value } };
}

module.exports = SongDetector;