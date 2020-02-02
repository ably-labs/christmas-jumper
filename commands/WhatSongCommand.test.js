const FakeResponse = require("../test-helpers/FakeResponse");
const InMemoryCurrentSongStorage = require("../features/song-detection/InMemoryCurrentSongStorage");
const WhatSongCommand = require("./WhatSongCommand");

describe("MusicToImageMapper", () => {

    let response, storage;
    beforeEach(() => {
        response = new FakeResponse();
        storage = new InMemoryCurrentSongStorage();
    });

    it("WhatSongCommand calls the song detector to identify music",  async () => {
        const songDetector = { "execute": () => "some song" };
        const sut = new WhatSongCommand(storage, songDetector);
        const request = { body: { bytes: "base64-encoded-bytes-from-browser" } };

        await sut.execute(request, response);

        expect(response.lastSentResponse().body.trim()).toBe("some song");
    });
    
    it("WhatSongCommand when the song detector doesn't know a song, returns previous most recent",  async () => {
        storage.save("previously heard");
        const songDetector = { "execute": () => { return { "unrecognised": true } } };
        const sut = new WhatSongCommand(storage, songDetector);

        await sut.execute({ body: { bytes: "" } }, response);

        expect(response.lastSentResponse().body).toBe("previously heard");
    });

    it("WhatSongCommand returns detected song.",  async () => {
        const request = { body: { bytes: Buffer.from([1,2,3,4]).toString("base64") } };
        const songDetector = { "execute": (bytes) => { return "jingle bell rock"; } };

        const sut = new WhatSongCommand(storage, songDetector);
        await sut.execute(request, response);

        expect(response.lastSentResponse().body).toBe("jingle bell rock");
    });

    it("WhatSongCommand saves deteted song in state.",  async () => {
        const request = { body: { bytes: Buffer.from([1,2,3,4]).toString("base64") } };
        const songDetector = { "execute": (bytes) => { return "jingle bell rock"; } };

        const sut = new WhatSongCommand(storage, songDetector);
        await sut.execute(request, response);

        expect(storage.get()).toBe("jingle bell rock");
    });

});
