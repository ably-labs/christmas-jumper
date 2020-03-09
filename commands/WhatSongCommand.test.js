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
        
    it("adds flag indicating song has changed in response, when song changes",  async () => {
        storage.save("initial song");

        const songDetector = { "execute": () => { return "different song" } };        
        const sut = new WhatSongCommand(storage, songDetector);

        await sut.execute({ body: { bytes: "" } }, response);

        expect(response.lastSentResponse().songChanged).toBeTruthy();
    });
        
    it("does not call onSongChanged when the song remains the same",  async () => {
        var songWasChanged = false;
        storage.save("song remains the same");

        const songDetector = { "execute": () => { return "song remains the same" } };        
        const sut = new WhatSongCommand(storage, songDetector, () => { songWasChanged = true;  });

        await sut.execute({ body: { bytes: "" } }, response);

        expect(songWasChanged).toBe(false);
    });
        
    it("calls onSongChanged callback when song has changed.",  async () => {
        var songWasChanged = false;
        storage.save("initial song");

        const songDetector = { "execute": () => { return "different song" } };        
        const sut = new WhatSongCommand(storage, songDetector, () => { songWasChanged = true; });

        await sut.execute({ body: { bytes: "" } }, response);

        expect(songWasChanged).toBe(true);
    });
});
