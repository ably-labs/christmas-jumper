const uuid = require('uuid/v1');
const JumperApi = require("./JumperApi");

describe("MusicToImageMapper", () => {

    it("detectActiveSong calls the song detector to identify music",  async () => {
        const songDetector = { "execute": () => "some song" };
        const sut = new JumperApi(songDetector);

        const result = await sut.detectSongFromClip("base64-encoded-bytes-from-browser");

        expect(result.body).toBe("some song");
    });

    it("detectActiveSong converts raw bytes correctly when detecting songs",  async () => {
        const bytesToMatch = [ 1, 2, 3, 4, 5 ];
        const inBase64 = Buffer.from(bytesToMatch).toString("base64");
        const songDetector = { "execute": (bytes) => {
                return JSON.stringify([...bytes]) === JSON.stringify(bytesToMatch) ? "matched" : "wrong bytes";
         } };

        const sut = new JumperApi(songDetector);

        const result = await sut.detectSongFromClip(inBase64);

        expect(result.body).toBe("matched");
    });

    it("remembers last recognised song between calls",  async () => {
        const songDetector = { "execute": () => "some song" };
        const sut = new JumperApi(songDetector);

        await sut.detectSongFromClip("base64-encoded-bytes-from-browser");
        const result = sut.mostRecentSong();

        expect(result).toBe("some song");
    });

    it("getActiveImageKey asks the image selector for an image key based on the most recent song detected.",  async () => {
        const randomSongReturned = uuid();
        const songDetector = { "execute": () => randomSongReturned };
        const imageSelector = { "execute": (passedSong) => (`key-for-${passedSong}`) };
        const sut = new JumperApi(songDetector, imageSelector);

        await sut.detectSongFromClip("base64-encoded-bytes-from-browser");
        const result = await sut.getActiveImageKey();

        expect(result.body).toBe(`key-for-${randomSongReturned}`);
    });
});
