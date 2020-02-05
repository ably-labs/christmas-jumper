class CachingFrameReader {
    constructor(nonCachingFrameReader) {
        this._imageData = {};
        this._nonCachingFrameReader = nonCachingFrameReader;
    }

    async loadFramesFor(imageKey) {
        if (!this._imageData.hasOwnProperty(imageKey)) {
            this._imageData[imageKey] = this._nonCachingFrameReader.loadFramesFor(imageKey);
        }
        return this._imageData[imageKey];
    }
}

module.exports = CachingFrameReader;