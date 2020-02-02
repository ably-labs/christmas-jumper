class FrameSerializer {
    serialize(frameData, compress) {
        const lines = [
            frameData.imageKey,
            `fc ${frameData.frameCount}`,
            `fi ${frameData.frameIndex}`,
        ];

        lines.push(frameData.palette.join(","));

        if (typeof frameData.frames !== "undefined") {
            for(const singleFrame of frameData.frames) {
                lines.push(this.prepareFrame(singleFrame, compress));
            }
        }

        return lines.join('\`') + "\`";
    }

    prepareFrame(singleFrame, foldRepeatingPixelsTogether) {
        if (!foldRepeatingPixelsTogether) {
            return singleFrame.duration + "," + singleFrame.b.join(",");
        }

        const pixelSequence = [];
        for (let bit of singleFrame.b) {
            if(pixelSequence.length > 0 && pixelSequence[pixelSequence.length - 1].value == bit) {
                pixelSequence[pixelSequence.length - 1].times++;
            } else {
                pixelSequence.push({value: bit, times: 1});
            }
        }

        const pixelSequenceAsString = pixelSequence.map(b => `${b.value}x${b.times} `.replace("x1 ", "").trim());

        return singleFrame.duration + "," + pixelSequenceAsString.join(",");
    }
}

module.exports = FrameSerializer;