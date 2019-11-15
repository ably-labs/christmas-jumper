const Jimp = require('jimp');

class ImageConverter {
    constructor() {
        this.lines = [];
    }

    async load(imageBytes, scale = true, targetWidth = 16, targetHeight = 16) {
        const originalImage = await Jimp.read(imageBytes);

        let image = originalImage;
        if (scale && (originalImage.getWidth() !== targetHeight || originalImage.getHeight() !== targetHeight)) {
            image = originalImage.resize(targetWidth, targetHeight);
        }

        for (let y = 0; y < image.bitmap.height; y++) {
            const row = [];

            for (let x = 0; x < image.bitmap.width; x++) {
                const hex = image.getPixelColor(x, y);
                const pixel = Jimp.intToRGBA(hex);
                row.push(pixel);
            }

            this.lines.push(row);
        }
        return this;
    }

    visualizeForDisplay() {
        return this.visualize(this.formatSinglePixelForPreview, this.formatEachRowForPreview, this.removeBlacksForPreview);
    }

    generateArray(formatSinglePixel = this.formatSinglePixelForHardware, snake = true) {
        const rowFormatter = snake ? this.trimAndSnakeRows: this.trimRows;
        return this.visualize(formatSinglePixel, rowFormatter, this.removeDoubleCommasFromArray);
    }

    visualize(pixelFormatter, rowFormatter, imageFormatter) {
        let output = '';
        for (let rowIndex = 0; rowIndex < this.lines.length; rowIndex++) {
            const line = this.lines[rowIndex];

            let lineBuffer = '';
            for(let pixelOnThisRowIndex in line) {
                lineBuffer += pixelFormatter(line[pixelOnThisRowIndex]);
            }

            output += rowFormatter(lineBuffer, rowIndex);
        }

        return imageFormatter(output);
    }

    // Preview formatting
    removeBlacksForPreview(image) { return image.replace(/000-000-000/g, "           ");  }
    formatSinglePixelForPreview(pixel) { return `[${pixel.r.toString().padStart(3, '0')}-${pixel.g.toString().padStart(3, '0')}-${pixel.b.toString().padStart(3, '0')}] `; }
    formatEachRowForPreview(rowOfPixels, index) {
        rowOfPixels = rowOfPixels.trim();
        rowOfPixels += '\r\n\r\n\r\n';
        return rowOfPixels;
    }

    // Byte array formatting
    trimRows(rowOfPixels, index) { return rowOfPixels.trim();  }
    removeDoubleCommasFromArray(image) { return image.replace(/,,/g, ","); }
    formatSinglePixelForHardware(pixel) { return `${pixel.r.toString().padStart(3, '0')}-${pixel.g.toString().padStart(3, '0')}-${pixel.b.toString().padStart(3, '0')},`; }
    trimAndSnakeRows(rowOfPixels, index) {
        rowOfPixels = rowOfPixels.trim();
        if (index % 2 != 0) {
            rowOfPixels = rowOfPixels.split("").reverse().join("");
        }
        return rowOfPixels;
    }
}

module.exports = ImageConverter;
