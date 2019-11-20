const ActiveImageSelector = require("./ActiveImageSelector");
const SongDetector = require("./SongDetector");
const FrameReader = require("./FrameReader");

class JumperApi {

    constructor(songDetector, imageSelector, frameReader) {
        this._mostRecentSong = "";
        this._songDetector = songDetector || new SongDetector();
        this._imageSelecctor = imageSelector || new ActiveImageSelector();
        this._frameReader = frameReader || new FrameReader();
    }

    mostRecentSong() {
        if(this._mostRecentSong === "") {
            return "default";
        }

        return this._mostRecentSong;
    }

    async detectSongFromClip(base64byteString) {
        const byteArray = Buffer.from(base64byteString, 'base64');
        const potentialSong = await this._songDetector.execute(byteArray);
        
        if(potentialSong.hasOwnProperty("unrecognised")) {            
            return this.ok(this._mostRecentSong);
        }

        this._mostRecentSong = potentialSong;
        return this.ok(this._mostRecentSong);
    }

    getActiveImageKey() {
        const result = this._imageSelecctor.execute(this.mostRecentSong());
        return this.ok(result);
    }

    async getActiveImageFrame(clientCurrentImageKey, clientCurrentFrameIndex) {
        const activeImageKey = await this._imageSelecctor.execute(this.mostRecentSong());
        const allFrames = await this._frameReader.execute(activeImageKey);

        let frameIndex = 0;
        if(clientCurrentImageKey == allFrames.imageKey && allFrames.frames.length > 1) {
            frameIndex = (clientCurrentFrameIndex + 1) >= allFrames.frames.length ? 0 : clientCurrentFrameIndex + 1;
        }

        const result = {
            imageKey: allFrames.imageKey,
            frameCount: allFrames.frames.length,
            frameIndex: frameIndex,
            frame: allFrames.frames[frameIndex],
            palette: allFrames.palette,
        };

        return this.ok(result);
    }

    ok(value) { return { status: 200, body: value } };
}

module.exports = JumperApi;
