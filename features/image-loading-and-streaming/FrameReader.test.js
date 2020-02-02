const FrameReader = require("./FrameReader");

const sut = new FrameReader();

describe("FrameReader", () => {

    it("can return snaked frames from valid detected image", async () => {
        const expectation = [0,0,0,0,0,0,1,1,2,1,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,3,1,1,2,1,0,0,0,0,0,0,0,0,1,1,2,1,1,3,3,1,1,1,0,0,0,0,0,1,1,4,4,2,2,2,4,4,5,4,1,0,0,0,0,1,4,5,4,4,2,2,2,2,4,4,1,0,0,0,0,1,4,4,2,2,2,4,4,4,5,4,1,0,0,0,0,1,4,5,4,4,4,2,2,2,4,4,1,0,0,0,0,1,1,1,3,3,3,1,1,1,1,1,1,0,0,0,0,1,4,5,4,4,4,2,2,2,4,4,1,0,0,0,0,1,4,4,2,2,2,4,4,4,5,4,1,0,0,0,0,1,1,1,1,1,1,3,3,3,1,1,1,0,0,0,4,1,4,4,2,2,2,4,4,4,5,4,1,4,0,4,1,4,5,4,4,4,4,4,2,2,2,4,4,1,4,1,4,4,4,2,2,2,4,4,4,4,4,4,4,4,1,1,1,1,1,1,1,1,1,1,3,3,3,1,1,1,1];
        const result = await sut.loadFramesFor("bell");

        expect(JSON.stringify(result.frames[0].b)).toBe(JSON.stringify(expectation));
    });

    it("single frame images have -1 duration", async () => {
        const result = await sut.loadFramesFor("default");

        expect(result.frames[0].duration).toBe(-1);
    });

    it("can get multiple frames when key has more than one image", async () => {
        const result = await sut.loadFramesFor("frametest");

        expect(result.frames.length).toBe(2);
    });

    it("frames load their durations where available", async () => {
        const result = await sut.loadFramesFor("frametest");

        expect(result.frames[0].duration).toBe(5000);
    });

    it("frames without durations default to ten second windows", async () => {
        const result = await sut.loadFramesFor("indexframetest");

        expect(result.frames[0].duration).toBe(10000);
    });
});
