const SongDetector = require("./SongDetector");

describe("SongDetector", () => {

    it("returns song title from AudD API call",  async () => {
        const sut = new SongDetector(fakeConfig, mockAxios, mockAzure);

        const result = await sut.execute(new ArrayBuffer(0));

        expect(result).toBe("some title");
    });

    it("calls AudD with API token from configuration",  async () => {
        const sut = new SongDetector(fakeConfig, mockAxios, mockAzure);

        await sut.execute(new ArrayBuffer(0));

        expect(urlsCalled[0].startsWith("https://api.audd.io/?api_token=some-audd-token")).toBe(true);
    });

    it("returns unrecognised when AudD doesn't know the song",  async () => {
        const sut = new SongDetector(fakeConfig, audDdoesntKnowTheSong, mockAzure);

        const result = await sut.execute(new ArrayBuffer(0));

        expect(result.unrecognised).toBe(true);
    });

    it("instructs AudD to download song from azure blob storage",  async () => {
        const sut = new SongDetector(fakeConfig, mockAxios, mockAzure);

        await sut.execute(new ArrayBuffer(0));

        const parts = urlsCalled[0].split('&url=')[1];
        expect(parts).toBe("http://some/uploaded/file/location");
    });

    it.skip("Integration test: can detect song that we know about when run against the real AudD API",  async () => {
        const sut = new SongDetector();
        const songContents = await require("fs").readFileSync("./test-data/02 - Jingle Bell Rock.mp3");

        const result = await sut.execute(songContents);

        expect(result.toLowerCase()).toBe("jingle bell rock");
    }, 10 * 1000);

    
    it.skip("Integration test: can detect multiple songs in sequence",  async () => {
        const sut = new SongDetector();
        const songContents1 = await require("fs").readFileSync("./test-data/01 - Rockin' Around The Christmas Tree.mp3");
        const songContents2 = await require("fs").readFileSync("./test-data/02 - Jingle Bell Rock.mp3");

        const result1 = await sut.execute(songContents1);
        const result2 = await sut.execute(songContents2);

        expect(result1.toLowerCase()).toBe("rockin' around the christmas tree");
        expect(result2.toLowerCase()).toBe("jingle bell rock");
    }, 10 * 1000);
});

const azureUploaderThatReturns = (url) => () => url;
const auddResponseWithTitle = (title) => ({ data: { result: { title: title } } });
const urlsCalled = [];
const axiosPostSucceeds = (responseObject) => ({
    post: (url) => {
        responseObject = responseObject;
        urlsCalled.push(url);
        return responseObject;
    }
});

const mockAxios = axiosPostSucceeds(auddResponseWithTitle("some title"));
const audDdoesntKnowTheSong = axiosPostSucceeds({ data: { result: { title: undefined } } });
const mockAzure = azureUploaderThatReturns("http://some/uploaded/file/location");
const fakeConfig = {
    "azure-account": "some-account",
    "azure-containerName": "some-container",
    "azure-blobStorage": `https://some-account.blob.core.windows.net`,
    "azure-key": "some-azure-key",
    "audd-token": "some-audd-token"
};
