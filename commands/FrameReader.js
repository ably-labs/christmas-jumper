const fs = require("fs");
const jimp = require("jimp");

class FrameReader {
    constructor(snakeFrames = true) {
        this._snakeFrames = snakeFrames;
    }

    async execute(imageKey) {
        const frames = [];
        const frameImages = this.findFramesFor(imageKey);

        for(let frame of frameImages) {
            const png = await jimp.read(`./images/${frame}`);
            const duration = this.establishFrameDuration(frame);
            const frameAsBytes = this.getSingleFrameFrom(png);
            let flattened = frameAsBytes.flat();

            frames.push({
                b: flattened,
                duration: duration
            });
        }

        const palette = this.paletteise(frames);

        return {
            imageKey: imageKey,
            snaked: this._snakeFrames,
            frames: frames,
            palette: palette
        };
    }

    paletteise(rgbFrames) {
        const allPixels = [];
        for (const frame of rgbFrames) {
            allPixels.push(...frame.b);
        }

        const palette = [...new Set(allPixels)];

        for (const frame of rgbFrames) {
            for (let index in frame.b) {
                const paletteIndex = palette.indexOf(frame.b[index]);
                frame.b[index] = paletteIndex;
            }
        }

        return palette;
    }

    findFramesFor(imageKey) {
        const singleFrameFilename = `${imageKey}.png`;
        if (fs.existsSync(`./images/${singleFrameFilename}`)) {
            return [singleFrameFilename];
        }

        const frameFiles = fs.readdirSync("./images/").filter(f => f.startsWith(`${imageKey}_`));
        return  [...frameFiles];
    }

    establishFrameDuration(match) {
        const frameParts = match.split('_');
        if (frameParts.length <= 1) {
            return -1;
        }

        const indexAndDuration = frameParts[1].replace(/.png/g, "");
        const indexAndDurationParts = indexAndDuration.split('-');
        return indexAndDurationParts.length === 2 ? parseInt(indexAndDurationParts[1]) : 10 * 1000;
    }

    getSingleFrameFrom(image) {
        const rows = [];
        for (let y = 0; y < image.bitmap.height; y++) {

            let row = [];

            for (let x = 0; x < image.bitmap.width; x++) {
                const hex = image.getPixelColor(x, y);
                const pixel = jimp.intToRGBA(hex);
                let hexCode = fullColorHex(pixel.r, pixel.g, pixel.b);
                row.push(hexCode);
            }

            if (this._snakeFrames && (y % 2 != 0)) {
                row = row.reverse();
            }

            rows.push(row);
        }

        return rows;
    }
}

var rgbToHex = function (rgb) { 
    var hex = Number(rgb).toString(16);
    if (hex.length < 2) {
         hex = "0" + hex;
    }
    return hex;
};

var fullColorHex = function(r,g,b) {   
    var red = rgbToHex(r);
    var green = rgbToHex(g);
    var blue = rgbToHex(b);
    return red+green+blue;
}

module.exports = FrameReader;
