class LedBytesSerializer {
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
    
    shouldSerialize(request) {
        return this.acceptsLedBytes(request) || this.shrinkParamInQueryString(request);
    }

    shouldCompress(request) {
        return this.acceptsEncodingPackedRgb(request) || this.shrinkParamInQueryString(request);
    }

    acceptsLedBytes(request)  { return request.headers["accept"] == "text/led-bytes"; };
    acceptsEncodingPackedRgb(request) { return request.headers["accept-encoding"] == "packed-rgb"; };
    shrinkParamInQueryString(request) { return  request.query.shrink && request.query.shrink == "true"; }
}

module.exports = LedBytesSerializer;