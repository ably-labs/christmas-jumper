const each = require('jest-each').default;
const ActiveImageSelector = require("./ActiveImageSelector");

const sut = new ActiveImageSelector();

describe("ActiveImageSelector", () => {

    it("can suggest an image ignoring the case of song names", () => {
        const returnedKey = sut.execute("jingle BELL rock")
        expect(returnedKey).toBe("bell");
    });

    each([
        ["jingle bell rock", "bell"],
        ["we wish you a merry christmas", "pud"],
    ]).it('Maps %s to %s', (song, key) => {
        const returnedImageKey = sut.execute(song);

        expect(returnedImageKey).toBe(key);
    });
});
