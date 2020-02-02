const CachingFrameReader = require("./CachingFrameReader");

describe("CachingFrameReader", () => {

    it("Will only load images from disk once", () => {
        var called = 0;
        const imageKey = "default";
        const nonCachingReader = {
            execute: () => {
                called++;
            }
        };

        const sut = new CachingFrameReader(nonCachingReader);

        sut.execute(imageKey);
        sut.execute(imageKey);

        expect(called).toBe(1);
    });

    it("Will return the same data for the same key on subsequent calls", async () => {        
        const imageKey = "default";        
        const nonCachingReader = {
            execute: () => {
                return [1, 2, 3];
            }
        };
        const sut = new CachingFrameReader(nonCachingReader);

        const bytes1 = sut.execute(imageKey);
        const bytes2 = sut.execute(imageKey);

        expect(bytes1).toEqual(bytes2);
    });
});