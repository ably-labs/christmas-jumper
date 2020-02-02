const request = require('supertest');
const app = require("./app");
const jimp = require("jimp");

describe("The App", () => {

    it("/active-image defaults to 'default'", async () => {
        const result = await request(app).get('/active-image');

        expect(result.statusCode).toBe(200);
        expect(result.text).toBe("default");
    });

    it("/active-image-frames can send non-json frames", async () => {
        const result = await request(app).get("/active-image-frames?currentImageKey=default&shrink=true");
        
        const containsBracket = result.text.indexOf("{") != -1; // lol, not json.
        expect(containsBracket).toBe(false);
    });

    it("/active-image-frames returns same etag when response hasn't changed", async () => {
        const result1 = await request(app).get("/active-image-frames?currentImageKey=frametest&currentFrameIndex=0&raw=true");
        const result2 = await request(app).get("/active-image-frames?currentImageKey=frametest&currentFrameIndex=1&raw=true");

        expect(result1.header["etag"]).toEqual(result2.header["etag"]);
    });

    it("/active-image-frames returns different etag when response has changed", async () => {
        const result1 = await request(app).get("/active-image-frames?currentImageKey=default&currentFrameIndex=0&raw=true");
        app["setMostRecentSong"]("sleigh ride");

        const result2 = await request(app).get("/active-image-frames?currentImageKey=default&currentFrameIndex=1&raw=true");

        expect(result1.header["etag"]).not.toEqual(result2.header["etag"]);
    });

    it("/active-image-frames when if none match header sent, will return not modified", async () => {
        const result1 = await request(app).get("/active-image-frames?currentImageKey=default&currentFrameIndex=0&raw=true");
        const etag = result1.header["etag"];

        const result2 = await request(app)
            .get("/active-image-frames?currentImageKey=default&currentFrameIndex=0&raw=true")
            .set("If-None-Match", etag);

        expect(result2.status).toBe(304);
    });

});