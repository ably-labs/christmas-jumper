class CachingFrameReader {
    constructor(nonCachingFrameReader) {
        this._imageData = {};
        this._nonCachingFrameReader = nonCachingFrameReader;
    }

    async execute(imageKey) {
        if (this._imageData.hasOwnProperty(imageKey)) {
            return this._imageData[imageKey];
        }
        this._imageData[imageKey] = this._nonCachingFrameReader.execute(imageKey);
        return this._imageData[imageKey];
    }
}

module.exports = CachingFrameReader;
