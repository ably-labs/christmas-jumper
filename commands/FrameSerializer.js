class FrameSerializer {
    serialize(frameData) {
        const lines = [
            frameData.imageKey,
            "frames " + frameData.frameCount,
            "findex " + frameData.frameIndex,
        ];

        lines.push(frameData.palette.join(","));

        if(typeof frameData.frame != "undefined" && typeof frameData.frame.b != "undefined") {
            lines.push(frameData.frame.duration + "," + frameData.frame.b.join(","));
        }

        if(typeof frameData.frames != "undefined") {
            for(const frame of frameData.frames) {
                lines.push(frame.duration + "," + frame.b.join(","));
            }
        }

        return lines.join("\`") + "\`";
    }
}

module.exports = FrameSerializer;