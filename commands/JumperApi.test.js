const uuid = require('uuid/v1');
const JumperApi = require("./JumperApi");

describe("MusicToImageMapper", () => {

    it("getActiveImageKey returns 'default' when no music has been heard at all.",  async () => {
        const songDetector = { "execute": () => "some song" };
        const sut = new JumperApi(songDetector);

        const result = await sut.getActiveImageKey();

        expect(result.body).toBe("default");
    });

    it("detectActiveSong calls the song detector to identify music",  async () => {
        const songDetector = { "execute": () => "some song" };
        const sut = new JumperApi(songDetector);

        const result = await sut.detectSongFromClip("base64-encoded-bytes-from-browser");

        expect(result.body).toBe("some song");
    });
    
    it("detectActiveSong when the song detector doesn't know a song, returns previous most recent",  async () => {
        const songDetector = { "execute": () => { return { "unrecognised": true } } };
        const sut = new JumperApi(songDetector);

        const result = await sut.detectSongFromClip("base64-encoded-bytes-from-browser");

        expect(result.body).toBe("");
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

    it("getActiveImageFrame asks the frame reader for an image based on the most recent song detected.",  async () => {
        const randomSongReturned = uuid();
        const songDetector = { "execute": () => randomSongReturned };
        const imageSelector = { "execute": (passedSong) => (`${passedSong}`) };
        const frameReader = { "execute": (passedKey) => ({
            "frames": [passedKey]
        })};

        const sut = new JumperApi(songDetector, imageSelector, frameReader);

        await sut.detectSongFromClip("base64-encoded-bytes-from-browser");
        const result = await sut.getActiveImageFrame("default", 0);

        expect(result.body["frames"][0]).toBe(randomSongReturned);
    });

    it("getActiveImageFrame returns next frame when image is part of an animation",  async () => {
        const songDetector = { "execute": () => "default" };
        const imageSelector = { "execute": (passedSong) => passedSong };
        const frameReader = { "execute": (passedKey) => ({
            "imageKey": "some-animation",
            "frames": [
                {b:[1]},
                {b:[2]}
            ]
        })};

        const sut = new JumperApi(songDetector, imageSelector, frameReader);
        await sut.detectSongFromClip("base64-encoded-bytes-from-browser");

        const result = await sut.getActiveImageFrame("some-animation", 0);

        expect(result.body["frames"][0].b[0]).toBe(2); // recieved second array element
    });

    it("getActiveImageFrame returns first frame when image is part of an animation and currently showing final frame",  async () => {
        const songDetector = { "execute": () => "default" };
        const imageSelector = { "execute": (passedSong) => passedSong };
        const frameReader = { "execute": (passedKey) => ({
            "imageKey": "some-animation",
            "frames": [
                {b:[1]},
                {b:[2]}
            ]
        })};

        const sut = new JumperApi(songDetector, imageSelector, frameReader);
        await sut.detectSongFromClip("base64-encoded-bytes-from-browser");

        const result = await sut.getActiveImageFrame("some-animation", 1);

        expect(result.body["frames"][0].b[0]).toBe(1); // recieved first array element
    });
});
