const FakeResponse = require("../test-helpers/FakeResponse");
const InMemoryCurrentSongStorage = require("../features/song-detection/InMemoryCurrentSongStorage");
const GetActiveImageCommand = require("./ActiveImageCommand");

describe("MusicToImageMapper", () => {
    let response, storage;
    beforeEach(() => {
        response = new FakeResponse();
        storage = new InMemoryCurrentSongStorage();
    });

    it("GetActiveImageCommand returns 'default' when no music has been heard at all.",  async () => {
        const sut = new GetActiveImageCommand(storage);

        await sut.execute(null, response);

        expect(response.lastSentResponse().trim()).toBe("default");
    });

    it("GetActiveImageCommand returns image key for song stored in state.",  async () => {
        storage.save("jingle bell rock");
        const sut = new GetActiveImageCommand(storage);

        await sut.execute(null, response);

        expect(response.lastSentResponse().trim()).toBe("bell");
    });
});
