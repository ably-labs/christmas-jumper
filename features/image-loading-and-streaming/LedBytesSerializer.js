class LedBytesSerializer {

    serialize(frameData, compress) {
        const lines = [
            frameData.imageKey,
            `fc ${frameData.frameCount}`,
            `fi ${frameData.frameIndex}`,
            frameData.palette.join(","),
            ...frameData.frames.map((f) => this.createSingleFrame(f, compress))
        ];

        return lines.join('\`') + "\`";
    }

    createSingleFrame(singleFrame, foldRepeatingPixelsTogether) {
        if (!foldRepeatingPixelsTogether) {
            return `${singleFrame.duration},${singleFrame.b.join(",")}`;
        }

        const pixels = [];
        for (let bit of singleFrame.b) {

            const pixel = this.bitIsSameAsLastBit(pixels, bit)
                ? pixels.pop()
                : {value: bit, times: 0};

            pixel.times++;
            pixels.push(pixel);
        }

        const sequence = pixels.map(b => `${b.value}x${b.times} `.replace("x1 ", "").trim());
        return `${singleFrame.duration},${sequence.join(",")}`;
    }
    
    bitIsSameAsLastBit(pixelSequence, bit) {
        return pixelSequence.length > 0 && pixelSequence[pixelSequence.length - 1].value === bit;
    }

    shouldSerialize(request) {
        return this.acceptsLedBytes(request) || this.shrinkParamInQueryString(request);
    }

    shouldCompress(request) {
        return this.acceptsEncodingPackedRgb(request) || this.shrinkParamInQueryString(request);
    }

    acceptsLedBytes(request) { return request.headers["accept"] === "text/led-bytes"; };
    acceptsEncodingPackedRgb(request) { return request.headers["accept-encoding"] === "packed-rgb"; };
    shrinkParamInQueryString(request) { return  request.query.shrink && request.query.shrink === "true"; }
}

module.exports = LedBytesSerializer;