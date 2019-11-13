const SongDetector = require("./SongDetector");
const fs = require("fs");

describe("Something", () => {

    it("Works", async () => {
        const sut = new SongDetector();
        const bytes = fs.read("../../test/jinglebells.mp3");

        const result = sut.execute();

        expect(result).toBe("blah");
    });
});