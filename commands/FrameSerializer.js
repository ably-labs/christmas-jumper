class FrameSerializer {
    serialize(frameData, compress) {
        const lines = [
            frameData.imageKey,
            `fc ${frameData.frameCount}`,
            `fi ${frameData.frameIndex}`,
        ];

        lines.push(frameData.palette.join(","));

        if(typeof frameData.frames !== "undefined") {
            for(const frame of frameData.frames) {
                lines.push(this.prepareFrame(frame, compress));
            }
        }


        return lines.join('\`') + "\`";
    }

    prepareFrame(frame, compress) {
        if(!compress) {
            return frame.duration + "," + frame.b.join(",");
        }        

        const bitOccurance = [];
        for(let bit of frame.b) {
            if(bitOccurance.length > 0 && bitOccurance[bitOccurance.length - 1].value == bit) {
                bitOccurance[bitOccurance.length - 1].times++;
            } else {
                bitOccurance.push({value: bit, times: 1});
            }
        }

        const asStrings = bitOccurance.map(b => `${b.value}x${b.times} `.replace("x1 ", "").trim());

        return frame.duration + "," + asStrings.join(",");
    }
}

module.exports = FrameSerializer;