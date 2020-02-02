const fs = require("fs");
const jimp = require("jimp");

class FrameReader {
    constructor(snakeFrames = true) {
        this._snakeFrames = snakeFrames;
    }

    async loadFramesFor(imageKey) {
        let frames = [];
        const frameImages = this.findFramesFor(imageKey);

        for(let frame of frameImages) {
            const bitmapData = await jimp.read(`./images/${frame}`);
            const duration = this.establishFrameDuration(frame);
            const frameAsBytes = this.getSingleFrameFrom(bitmapData);
            frames.push({ b: frameAsBytes, duration: duration });
        }

        const palette = this.generatePaletteFrom(frames);
        frames = this.swapColoursForPaletteReferences(frames, palette);

        return {
            imageKey: imageKey,
            snaked: this._snakeFrames,
            frames: frames,
            palette: palette
        };
    }


    generatePaletteFrom(rgbFrames) {
        const allPixels = [];
        for (const frame of rgbFrames) {
            allPixels.push(...frame.b);
        }

        return [...new Set(allPixels)];
    }

    swapColoursForPaletteReferences(rgbFrames, palette) {
        for (const frame of rgbFrames) {
            for (let index in frame.b) {
                const paletteIndex = palette.indexOf(frame.b[index]);
                frame.b[index] = paletteIndex;
            }
        }
        return rgbFrames;
    }

    findFramesFor(imageKey) {
        const singleFrameFilename = `${imageKey}.png`;
        if (fs.existsSync(`./images/${singleFrameFilename}`)) {
            return [singleFrameFilename];
        }

        const frameFiles = fs.readdirSync("./images/").filter(f => f.startsWith(`${imageKey}_`));
        return  [...frameFiles];
    }

    establishFrameDuration(fileName) {
        const fileNameParts = fileName.split('_');
        if (fileNameParts.length <= 1) {
            return -1;
        }

        const indexAndDuration = fileNameParts[1].replace(/.png/g, "");
        const indexAndDurationParts = indexAndDuration.split('-');
        return indexAndDurationParts.length === 2 ? parseInt(indexAndDurationParts[1]) : 10 * 1000;
    }

    getSingleFrameFrom(bitmapData) {
        const rows = [];
        for (let y = 0; y < bitmapData.bitmap.height; y++) {

            let row = [];

            for (let x = 0; x < bitmapData.bitmap.width; x++) {
                const hex = bitmapData.getPixelColor(x, y);
                const pixel = jimp.intToRGBA(hex);
                let hexCode = fullColorHex(pixel.r, pixel.g, pixel.b);
                row.push(hexCode);
            }

            if (this._snakeFrames && (y % 2 != 0)) {
                row = row.reverse();
            }

            rows.push(row);
        }

        return rows.flat();
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
