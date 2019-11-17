const ActiveImageSelector = require("./ActiveImageSelector");
const SongDetector = require("./SongDetector");

class JumperApi {

    constructor(songDetector, imageSelector) {
        this._mostRecentSong = "";
        this._songDetector = songDetector || new SongDetector();
        this._imageSelecctor = imageSelector || new ActiveImageSelector();
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

    getActiveImageFrames() {
        const result = this._imageSelecctor.getFrames(this.mostRecentSong());
        return this.ok(result);
    }

    ok(value) { return { status: 200, body: value } };
}

module.exports = JumperApi;
