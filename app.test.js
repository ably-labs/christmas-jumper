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
        const result = await request(app).get("/active-image-frames?currentImageKey=default&raw=true");
        
        const containsBracket = result.text.indexOf("{") != -1; // lol, not json.
        expect(containsBracket).toBe(false);
    });

});