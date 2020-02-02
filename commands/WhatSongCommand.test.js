const FakeResponse = require("../test-helpers/FakeResponse");
const InMemoryCurrentSongStorage = require("../features/state-management/InMemoryCurrentSongStorage");
const WhatSongCommand = require("./WhatSongCommand");

describe("WhatSongCommand handler", () => {

    let response, storage;
    beforeEach(() => {
        response = new FakeResponse();
        storage = new InMemoryCurrentSongStorage();
    });
    
    it("returns previously heard song title when it doesn't recognise the current track",  async () => {
        storage.save("previously heard");
        const songDetector = { "execute": () => { return { "unrecognised": true } } };
        const sut = new WhatSongCommand(storage, songDetector);

        await sut.execute({ body: { bytes: "" } }, response);

        expect(response.lastSentResponse().body).toBe("previously heard");
    });

    it("returns the name of any detected song",  async () => {
        const request = { body: { bytes: Buffer.from([1,2,3,4]).toString("base64") } };
        const songDetector = { "execute": (bytes) => { return "some detected song"; } };

        const sut = new WhatSongCommand(storage, songDetector);
        await sut.execute(request, response);

        expect(response.lastSentResponse().body).toBe("some detected song");
    });

    it("saves the last detected song title in state",  async () => {
        const request = { body: { bytes: Buffer.from([1,2,3,4]).toString("base64") } };
        const songDetector = { "execute": (bytes) => { return "some detected song"; } };

        const sut = new WhatSongCommand(storage, songDetector);
        await sut.execute(request, response);

        expect(storage.get()).toBe("some detected song");
    });
});
