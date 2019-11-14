const uuid = require('uuid/v1');
const JumperApi = require("./JumperApi");

const bufferOf123inBase64 = "AQID";

describe("MusicToImageMapper", () => {

    it("detectActiveSong calls the song detector to identify music",  async () => {
        const songDetector = { "execute": () => "some song" };
        const sut = new JumperApi(songDetector);

        const result = await sut.detectSongFromClip(bufferOf123inBase64);

        expect(result.body).toBe("some song");
    });

    it("remembers last recognised song between calls",  async () => {
        const songDetector = { "execute": () => "some song" };
        const sut = new JumperApi(songDetector);

        await sut.detectSongFromClip(bufferOf123inBase64);
        const result = sut.mostRecentSong();

        expect(result).toBe("some song");
    });

    it("getCurrentlyActiveImage asks the image selector for an image key based on the most recent song detected.",  async () => {
        const randomSongReturned = uuid();
        const songDetector = { "execute": () => randomSongReturned };
        const imageSelector = { "execute": (passedSong) => (`key-for-${passedSong}`) };
        const sut = new JumperApi(songDetector, imageSelector);

        await sut.detectSongFromClip(bufferOf123inBase64);
        const result = await sut.getCurrentlyActiveImage();

        expect(result.body).toBe(`key-for-${randomSongReturned}`);
    });
});
