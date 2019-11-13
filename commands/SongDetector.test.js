const SongDetector = require("./SongDetector");
const fs = require("fs");

describe("Song detector", () => {

    it("Can detect song that we know about",  async () => {
        const sut = new SongDetector();
        const songContents = await fs.readFileSync("./test-data/02 - Jingle Bell Rock.mp3");

        const result = await sut.execute(songContents);

        expect(result.body.toLowerCase()).toBe("jingle bell rock");
    });
});