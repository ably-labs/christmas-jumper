const ImageConverter = require('./imageConverter');

describe('ImageConverter', () => {
    it('Can preview transcoding in the terminal', async () => {
        const mapped = new ImageConverter();
        const imageBytes = await require("fs").readFileSync("./test-data/3x3-pallet.jpg");

        await mapped.load(imageBytes, false);

        console.log(mapped.visualizeForDisplay());
    });

    it('Can generate an array of bytes to be embedded', async () => {
        const mapped = new ImageConverter();
        const imageBytes = await require("fs").readFileSync("./test-data/3x3-pallet.jpg");

        await mapped.load(imageBytes, false);

        console.log(mapped.generateArray());
    });
});
