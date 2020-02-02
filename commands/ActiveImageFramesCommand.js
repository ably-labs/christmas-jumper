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
        const lastRecognisedSong = this._currentSongStorage.getOrDefault();
        const activeImageKey = await this._imageSelector.getImageKeyForSong(lastRecognisedSong);
        const allFrames = await this._frameReader.execute(activeImageKey);

        let frameIndex = this.generateNextFrameIndex(request.query.currentImageKey, allFrames, parseInt(request.query.currentFrameIndex));

        let output = {
            imageKey: allFrames.imageKey,
            frameCount: allFrames.frames.length,
            frameIndex: frameIndex,
            frames: [ 
                allFrames.frames[frameIndex] 
            ],
            palette: allFrames.palette,
        };
    
        this.sendResponse(request, response, output);
    }
    
    sendResponse(request, response, output) {
        if (this.headerForLedBytes(request) || this.queryStringOverride(request)) {
            const compress = this.headerForPackedRgb(request) || this.queryStringOverride(request);
            response.set("Content-Type", "text/led-bytes");
            
            if (compress) {
                response.set("Content-Encoding", "packed-rgb");
            }
            
            var body = this._serializer.serialize(output, compress) + "\r";
            response.send(body);
            return;
        }
        
        var body = JSON.stringify(output) + "\r";        
        response.set("Content-Type", "application/json");
        response.send(body);
    }

    generateNextFrameIndex(clientCurrentImageKey, allFrames, clientCurrentFrameIndex) {
        let frameIndex = 0;
        if (clientCurrentImageKey == allFrames.imageKey && allFrames.frames.length > 1) {
            frameIndex = (clientCurrentFrameIndex + 1) >= allFrames.frames.length ? 0 : clientCurrentFrameIndex + 1;
        }
        return frameIndex;
    }

    headerForLedBytes(request)  { return request.headers["accept"] == "text/led-bytes"; };
    headerForPackedRgb(request) { return request.headers["accept-encoding"] == "packed-rgb"; };
    queryStringOverride(request) { return  request.query.shrink && request.query.shrink == "true"; }
}

module.exports = ActiveImageFramesCommand;
