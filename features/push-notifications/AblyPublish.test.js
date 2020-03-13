const config = require("../../config");
const Ably = require("ably");
const AblyConnector = require("./AblyPublish");

describe("Ably push notifications", () => {

    let sut, ably, channel, publishedData;
    beforeEach(() => {
        publishedData = [];
        channel = { publish: (event, data) => { publishedData.push(data); } };
        ably = { channels: { get: () => channel } };
        
        // ably = new Ably.Realtime(config["ably-api-key"]);
        sut = new AblyConnector(ably);
    });

    it("Publishes compressed image payload", async () => {
        await sut.publishToAbly("default");
        // await sut.publishToAbly("let it snow! let it snow! let it snow!");

        expect(publishedData[0]).toBe("default`fc 1`fi -1`ff0000,000000`-1,0,1x255`");
    });

    it("Publishes compressed image payload successfully more than once", async () => {
        await sut.publishToAbly("default");
        await sut.publishToAbly("default");

        expect(publishedData[0]).toBe("default`fc 1`fi -1`ff0000,000000`-1,0,1x255`");
        expect(publishedData[1]).toBe("default`fc 1`fi -1`ff0000,000000`-1,0,1x255`");
    });
});