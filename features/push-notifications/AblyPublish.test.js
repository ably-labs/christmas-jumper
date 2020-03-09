const config = require("../../config");
const AblyConnector = require("./AblyPublish");

describe("Ably push notifications", () => {

    let sut, fakeAbly, ablyChannel;
    let publishedData = null;
    beforeEach(() => {
        ablyChannel = { publish: (event, data) => { publishedData = data; } };
        fakeAbly = { channels: { get: () => { return ablyChannel; } } };
        // const Ably = require("ably");
        // const realAbly = Ably.Realtime(config["ably-api-key"]);
        sut = new AblyConnector(fakeAbly);
    });

    it("Publishes compressed image payload", async () => {
        await sut.publishToAbly("default");

        expect(publishedData).toBe("default`fc 1`fi -1`ff0000,000000`-1,0,1x255`");
    });

});