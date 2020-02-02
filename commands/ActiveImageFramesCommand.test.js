const uuid = require('uuid/v1');
const FakeResponse = require("../test-helpers/FakeResponse");
const InMemoryCurrentSongStorage = require("../features/state-management/InMemoryCurrentSongStorage");
const GetActiveImageFramesCommand = require("./ActiveImageFramesCommand");

describe("MusicToImageMapper", () => {

    let response, storage;
    beforeEach(() => {
        response = new FakeResponse();
        storage = new InMemoryCurrentSongStorage();
    });

    it("GetActiveImageFramesCommand asks the frame reader for an image based on the most recent song detected.",  async () => {
        storage.save("jingle bell rock");
        const sut = new GetActiveImageFramesCommand(storage);

        await sut.execute({
            query: { currentImageKey: "default", currentFrameIndex: 0 },
            headers: []        
        }, response);

        expect(responseJson().imageKey).toBe("bell");
    });

    it("GetActiveImageFramesCommand returns next frame when image is part of an animation",  async () => {
        storage.save("frametest");
        const sut = new GetActiveImageFramesCommand(storage);

        await sut.execute({
            query: { currentImageKey: "frametest", currentFrameIndex: 0 },
            headers: []        
        }, response);

        expect(responseJson().frameIndex).toBe(1);
    });

    it("GetActiveImageFramesCommand returns first frame when image is part of an animation and currently showing final frame",  async () => {
        storage.save("frametest");
        const sut = new GetActiveImageFramesCommand(storage);

        await sut.execute({
            query: { currentImageKey: "frametest", currentFrameIndex: 1 },
            headers: []        
        }, response);

        expect(responseJson().frameIndex).toBe(0);
    });
    
    responseJson = () => {
        return JSON.parse(response.lastSentResponse());
    }
});
