const FrameSerializer = require("./FrameSerializer");

describe("Frame serializer", () => {

    it("Can serialize a frame to the non-json wireformat", () => {
        const result = new FrameSerializer().serialize(validSingleFrameData);
        const parts = result.split("\`");

        expect(parts[0]).toBe("default");
        expect(parts[1]).toBe("frames 1");
        expect(parts[2]).toBe("findex 0");
    });

    it("Can correctly serialize the frame duration", () =>{
        const result = new FrameSerializer().serialize(validSingleFrameData);
        const parts = result.split("\`");

        expect(parts[4].startsWith("1000,")).toBe(true);
    });

    it("Can correctly serialize the palette", () =>{
        const result = new FrameSerializer().serialize(validSingleFrameData);
        const parts = result.split("\`");

        expect(parts[3]).toBe("ff0000,000000");
    });

    it("Can correctly serialize a single frame", () =>{
        const result = new FrameSerializer().serialize(validSingleFrameData);
        const parts = result.split("\`");

        expect(parts[4]).toBe("1000,0,1");
    });

    it("Can correctly serialize multiple frames", () =>{
        const result = new FrameSerializer().serialize(validMultipleFrameData);
        const parts = result.split("\`");

        expect(parts[4]).toBe("1000,0,1");
        expect(parts[5]).toBe("1000,1,0");
    });

    it("Always ends the packet with a backtick", () =>{
        const result = new FrameSerializer().serialize(validMultipleFrameData);

        expect(result.endsWith("\`")).toBe(true);
    });

});

const validSingleFrameData = {
    imageKey: "default",
    frameCount: 1,
    frameIndex: 0,
    frame: { b: [0, 1], duration: 1000 },
    palette: ["ff0000", "000000"],
};

const validMultipleFrameData = {
    imageKey: "default",
    frameCount: 1,
    frameIndex: 0,
    frames: [
        { b: [0, 1], duration: 1000 },
        { b: [1, 0], duration: 1000 }
    ],
    palette: ["ff0000", "000000"],
};