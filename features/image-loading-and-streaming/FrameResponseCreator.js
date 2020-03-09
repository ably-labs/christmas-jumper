function formatFrames(allFrames) {
    return {
        imageKey: allFrames.imageKey,
        frameCount: allFrames.frames.length,
        frameIndex: -1,
        frames: allFrames.frames,
        palette: allFrames.palette,
    };
}

module.exports = formatFrames;