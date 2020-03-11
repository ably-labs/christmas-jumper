const ImageSelector = require("../image-selection/ImageSelector");
const FrameReader = require("../image-loading-and-streaming/FrameReader");
const createFrameResponse = require("../image-loading-and-streaming/FrameResponseCreator");
const LedBytesSerializer = require("../image-loading-and-streaming/LedBytesSerializer");

class AblyConnector {

    constructor(albyClient) {
        this._imageSelector = new ImageSelector();
        this._frameReader = new FrameReader();
        this._ledBytesSerializer = new LedBytesSerializer();
        this._client = albyClient;       
    }

    async publishToAbly(lastRecognisedSong) {
        const activeImageKey = await this._imageSelector.getImageKeyForSong(lastRecognisedSong);
        const allFrames = await this._frameReader.loadFramesFor(activeImageKey);       
        const uncompressedOutput = createFrameResponse(allFrames);
        const output = this._ledBytesSerializer.serialize(uncompressedOutput, true);

        const channel = this._client.channels.get("jumper");
        channel.publish(null, output);

        /*this._client.subscribe('jumper');
        this._client.publish('jumper', output);
        this._client.subscribe('jumper');*/
    }
}

module.exports = AblyConnector;