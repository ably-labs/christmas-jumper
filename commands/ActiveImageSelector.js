const fs = require("fs");
const jimp = require("jimp");

class ActiveImageSelector {
    constructor(snakeFrames = true) {
        this._snakeFrames = snakeFrames;
    }

    execute(mostRecentSong) {
        if(mostRecentSong === "default") {
            return "default";
        }

        const cleaned = mostRecentSong.toLowerCase();
        const map = {
            "jingle bell rock": "bell",
            "let it snow! let it snow! let it snow!": "snow",
            "rockin' around the christmas tree": "tree",
            "santa claus is coming to town": "santa",
            "deck the halls": "holly",
            "we wish you a merry christmas": "pud",
            "fairytale of new york (feat. kirsty maccoll)": "star",
            "white christmas": "snow",
            "sleigh ride": "sled",
            "jingle bells - 1": "bell",
            "christmas alphabet": "sock",
            "santa baby": "hat",
            "all i want for christmas is you": "gift",
            "it's the most wonderful time of the year": "candy",
            "rudolph the red-nosed reindeer": "deer",
            "frosty the snowman": "frosty"
        };

        return map[cleaned];
    }

    async getFrames(mostRecentSong) {
        const imageKey = this.execute(mostRecentSong);
        return await this.getFramesForKey(imageKey);
    }

    async getFramesForKey(imageKey) {
        const result = {
            imageKey: imageKey,
            snaked: this._snakeFrames,
            rgbFrames: []
        };

        const frameImages = [];
        const singleFrameFilename = `${imageKey}.png`;

        if(fs.existsSync(`./images/${singleFrameFilename}`)){
            frameImages.push(singleFrameFilename);
        } else {
            frameImages.push(...fs.readdirSync("./images/").filter(f => f.startsWith(`${imageKey}_`)));
        }

        for(let match of frameImages) {
            const image = await jimp.read(`./images/${match}`);
            const frame = this.getSingleFrameFrom(image);
            result.rgbFrames.push(frame.flat());
        }

        return result;
    }

    getSingleFrameFrom(image) {
        const rows = [];
        for (let y = 0; y < image.bitmap.height; y++) {

            let row = [];

            for (let x = 0; x < image.bitmap.width; x++) {
                const hex = image.getPixelColor(x, y);
                const pixel = jimp.intToRGBA(hex);

                row.push(
                    [pixel.r, pixel.g, pixel.b]
                );
            }

            if (this._snakeFrames && (y % 2 != 0)) {
                row = row.reverse();
            }

            rows.push(row);
        }
        return rows;
    }
}

module.exports = ActiveImageSelector;
