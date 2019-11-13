class ActiveImageSelector {
    constructor() {
    };

    async execute() {
        return this.ok("pud");
    };

    ok(value) { return { status: 200, body: value } };
}

module.exports = ActiveImageSelector;