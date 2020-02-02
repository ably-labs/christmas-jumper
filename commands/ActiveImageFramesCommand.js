const FrameSerializer = require("../features/image-loading-and-streaming/FrameSerializer");
const ImageSelector = require("../features/image-selection/ImageSelector");
const FrameReader = require("../features/image-loading-and-streaming/FrameReader");
const CachingFrameReader = require("../features/image-loading-and-streaming/CachingFrameReader");

class ActiveImageFramesCommand {
    constructor(currentSongStorage, imageSelector, frameReader) {
        this._currentSongStorage = currentSongStorage;
        this._imageSelector = imageSelector || new ImageSelector();
        this._frameReader = frameReader || new CachingFrameReader(new FrameReader());
        this._serializer = new FrameSerializer();
    }

    async execute(request, response) {
        const result = await this.getActiveImageFrame(request.query.currentImageKey, parseInt(request.query.currentFrameIndex));
        let output = result.body;
    
        if (this.headerForLedBytes(request) || this.queryStringOverride(request)) {        
            const compress = this.headerForPackedRgb(request) || this.queryStringOverride(request);
    
            response.set("Content-Type", "text/led-bytes");
    
            if (compress) {
                response.set("Content-Encoding", "packed-rgb");
            }
    
            output = this._serializer.serialize(output, compress);
            output += "\r";
        } else {
            response.set("Content-Type", "application/json");
            output = JSON.stringify(output) + "\r";
        }
    
        response.send(output);
    }
    
    async getActiveImageFrame(clientCurrentImageKey, clientCurrentFrameIndex) {
        const activeImageKey = await this._imageSelector.execute(this._currentSongStorage.getOrDefault());
        const allFrames = await this._frameReader.execute(activeImageKey);

        let frameIndex = 0;
        if(clientCurrentImageKey == allFrames.imageKey && allFrames.frames.length > 1) {
            frameIndex = (clientCurrentFrameIndex + 1) >= allFrames.frames.length ? 0 : clientCurrentFrameIndex + 1;
        }

        return this.ok({
            imageKey: allFrames.imageKey,
            frameCount: allFrames.frames.length,
            frameIndex: frameIndex,
            frames: [ 
                allFrames.frames[frameIndex] 
            ],
            palette: allFrames.palette,
        });
    }

        
    ok (value) { return { status: 200, body: value } };
    headerForLedBytes(request)  { return request.headers["accept"] == "text/led-bytes"; };
    headerForPackedRgb(request) { return request.headers["accept-encoding"] == "packed-rgb"; };
    queryStringOverride(request) { return  request.query.shrink && request.query.shrink == "true"; }
}

module.exports = ActiveImageFramesCommand;