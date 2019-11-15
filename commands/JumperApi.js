const ActiveImageSelector = require("./ActiveImageSelector");
const SongDetector = require("./SongDetector");

class JumperApi {

    constructor(songDetector, imageSelector) {
        this._mostRecentSong = "";
        this._songDetector = songDetector || new SongDetector();
        this._imageSelecctor = imageSelector || new ActiveImageSelector();
    }

    mostRecentSong() {
        return this._mostRecentSong;
    }

    async detectSongFromClip(base64byteString) {
        const byteArray = Buffer.from(base64byteString, 'base64');
        this._mostRecentSong = await this._songDetector.execute(byteArray);
        return this.ok(this._mostRecentSong);
    }

    getActiveImageKey() {
        const result = this._imageSelecctor.execute(this._mostRecentSong);
        return this.ok(result);
    }

    ok(value) { return { status: 200, body: value } };
}

module.exports = JumperApi;
