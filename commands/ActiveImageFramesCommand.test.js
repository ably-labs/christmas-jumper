const uuid = require('uuid/v1');
const FakeResponse = require("../test-helpers/FakeResponse");
const InMemoryCurrentSongStorage = require("../features/song-detection/InMemoryCurrentSongStorage");
const GetActiveImageFramesCommand = require("./ActiveImageFramesCommand");

describe("MusicToImageMapper", () => {

    let response, storage;
    beforeEach(() => {
        response = new FakeResponse();
        storage = new InMemoryCurrentSongStorage();
    });

    it("GetActiveImageFramesCommand asks the frame reader for an image based on the most recent song detected.",  async () => {
        const randomSongReturned = uuid();
        const imageSelector = { "execute": () => (`${randomSongReturned}`) };
        const frameReader = { "execute": (passedKey) => ({
            "frames": [passedKey]
        })};

        const sut = new GetActiveImageFramesCommand(storage, imageSelector, frameReader);
        await sut.execute({
            body: {
                 bytes: "base64-encoded-bytes-from-browser" 
            },
            query: {
                currentImageKey: "default",
                currentFrameIndex: 0
            },
            headers: []        
        }, response);

        expect(response.lastSentResponse().indexOf(randomSongReturned)).not.toBe(-1);
    });

    it("GetActiveImageFramesCommand returns next frame when image is part of an animation",  async () => {
        const frameReader = { "execute": (passedKey) => ({
            "imageKey": "some-animation",
            "frames": [
                {b:[1]},
                {b:[2]}
            ]
        })};

        const sut = new GetActiveImageFramesCommand(storage, null, frameReader);
        await sut.execute({
            body: {
                 bytes: "base64-encoded-bytes-from-browser" 
            },
            query: {
                currentImageKey: "some-animation",
                currentFrameIndex: 0
            },
            headers: []        
        }, response);

        expect(response.lastSentResponse().indexOf(":[2]")).not.toBe(-1);
    });

    it("GetActiveImageFramesCommand returns first frame when image is part of an animation and currently showing final frame",  async () => {
        const frameReader = { "execute": (passedKey) => ({
            "imageKey": "some-animation",
            "frames": [
                {b:[1]},
                {b:[2]}
            ]
        })};

        const sut = new GetActiveImageFramesCommand(storage, null, frameReader);
        await sut.execute({
            body: {
                 bytes: "base64-encoded-bytes-from-browser" 
            },
            query: {
                currentImageKey: "some-animation",
                currentFrameIndex: 1
            },
            headers: []        
        }, response);

        expect(response.lastSentResponse().indexOf(":[1]")).not.toBe(-1);
    });
});
