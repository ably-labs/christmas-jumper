const fs = require("fs");
const jimp = require("jimp");

class FrameReader {
    constructor(snakeFrames = true) {
        this._snakeFrames = snakeFrames;
    }

    async execute(imageKey) {
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

            let duration = -1;
            const frameParts = match.split('_');
            if(frameParts.length > 1) {
                const indexAndDuration = frameParts[1].replace(/.png/g, "");
                const indexAndDurationParts = indexAndDuration.split('-');
                duration = indexAndDurationParts.length === 2 ? parseInt(indexAndDurationParts[1]) : 10 * 1000;
            }

            const frame = this.getSingleFrameFrom(image);

            result.rgbFrames.push({
                data: frame.flat(),
                duration: duration
            });
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

module.exports = FrameReader;
