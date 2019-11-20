const fs = require("fs");
const jimp = require("jimp");

class FrameReader {
    constructor(snakeFrames = true) {
        this._snakeFrames = snakeFrames;
    }

    async execute(imageKey) {
        const rgbFrames = [];
        const frameImages = this.findFramesFor(imageKey);

        for(let frame of frameImages) {
            const png = await jimp.read(`./images/${frame}`);
            const duration = this.establishFrameDuration(frame);
            const frameAsBytes = this.getSingleFrameFrom(png);

            let flattened = frameAsBytes.flat();
            
            // Dodgy optimisations - if the pixel colour hasn't changed
            // replace it with an empty element to save space.
            for(let i = flattened.length -1; i > 0; i--) {
                const precursor = flattened[i - 1];
                if (flattened[i] == precursor) {
                    flattened[i] = "";
                }
            }

            rgbFrames.push({
                data: flattened,
                duration: duration
            });
        }

        return {
            imageKey: imageKey,
            snaked: this._snakeFrames,
            frameCount: rgbFrames.length,
            rgbFrames: rgbFrames
        };
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

                if(hexCode === "000000") {
                    hexCode = "x"
                }

                if(hexCode === "ffffff") {
                    hexCode = "w"
                }

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
