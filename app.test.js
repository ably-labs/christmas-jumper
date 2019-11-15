const request = require('supertest');
const app = require("./app");

describe("The App", () => {

    it("Can fetch the most recent image key over a HTTP GET", async () => {
        const result = await request(app).get('/active-image');

        expect(result.statusCode).toBe(200);
        expect(result.text).toBe("bell");
    });
});
