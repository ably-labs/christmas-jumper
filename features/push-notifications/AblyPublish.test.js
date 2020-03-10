const config = require("../../config");
const AblyConnector = require("./AblyPublish");

describe("Ably push notifications", () => {

    let sut, ably, publishedData;
    beforeEach(() => {
        publishedData = [];
        ably = {  
            subscribe: () => {  },
            end: () => {  },
            publish: (event, data) => { publishedData.push(data); },
        };
        
        //ably = createRealMqttClient();
        sut = new AblyConnector(ably);
    });

    it("Publishes compressed image payload", async () => {
        await sut.publishToAbly("default");

        expect(publishedData[0]).toBe("default`fc 1`fi -1`ff0000,000000`-1,0,1x255`");
    });

    it("Publishes compressed image payload successfully more than once", async () => {
        await sut.publishToAbly("default");
        await sut.publishToAbly("default");

        expect(publishedData[0]).toBe("default`fc 1`fi -1`ff0000,000000`-1,0,1x255`");
        expect(publishedData[1]).toBe("default`fc 1`fi -1`ff0000,000000`-1,0,1x255`");
    });

    function createRealMqttClient() {
        const mqtt = require("mqtt");
        const creds = config["ably-api-key"].split(':');        
        return mqtt.connect("mqtts://mqtt.ably.io", {
            username: creds[0],
            password: creds[1]
        }); 
    }
});