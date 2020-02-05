class InMemoryCurrentSongStorage {
    constructor() {
        this._mostRecentSong = "";
    }

    get() { return this._mostRecentSong; }
    getOrDefault() { return this.get() === "" ? "default" : this.get(); }

    save(key) { this._mostRecentSong = key; }
}

module.exports = InMemoryCurrentSongStorage;