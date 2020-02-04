class LedBytesSerializer {

    serialize(frameData, compress) {
        const lines = [
            frameData.imageKey,
            `fc ${frameData.frameCount}`,
            `fi ${frameData.frameIndex}`,
            frameData.palette.join(",")
        ];

        for (const singleFrame of frameData.frames) {
            lines.push(this.createStringRepresentationOfFrame(singleFrame, compress));
        }

        return lines.join('\`') + "\`";
    }

    createStringRepresentationOfFrame(singleFrame, foldRepeatingPixelsTogether) {
        if (!foldRepeatingPixelsTogether) {
            return `${singleFrame.duration},${singleFrame.b.join(",")}`;
        }

        const pixels = [];
        for (let bit of singleFrame.b) {

            var pixel = this.bitIsSameAsLastBit(pixels, bit) 
                ? pixels.pop() 
                : { value: bit, times: 0 };

            pixel.times++;
            pixels.push(pixel);
        }

        const sequence = pixels.map(b => `${b.value}x${b.times} `.replace("x1 ", "").trim());
        return `${singleFrame.duration},${sequence.join(",")}`;
    }
    
    bitIsSameAsLastBit(pixelSequence, bit) {
        return pixelSequence.length > 0 && pixelSequence[pixelSequence.length - 1].value == bit;
    }

    shouldSerialize(request) {
        return this.acceptsLedBytes(request) || this.shrinkParamInQueryString(request);
    }

    shouldCompress(request) {
        return this.acceptsEncodingPackedRgb(request) || this.shrinkParamInQueryString(request);
    }

    acceptsLedBytes(request) { return request.headers["accept"] == "text/led-bytes"; };
    acceptsEncodingPackedRgb(request) { return request.headers["accept-encoding"] == "packed-rgb"; };
    shrinkParamInQueryString(request) { return  request.query.shrink && request.query.shrink == "true"; }
}

module.exports = LedBytesSerializer;