const express = require("express");
const request = require("supertest");

const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");

// import your router, logger, and errorHandler
const photoRouter = require("../src/routes/photoRouter");
const logger = require("../src/middleware/logger");
const errorHandler = require("../src/middleware/errorHandler");

function createTestApp() {
        const app = express();
        app.use(express.json());
        app.use(logger); // optional if you want to test logging
        app.use("/photos", photoRouter);
        app.use(errorHandler); // must be last
        return app;
}

describe("photoRouter", () => {
        let app;

        beforeEach(() => {
                app = createTestApp();
        });

        it("GET /photos returns all photos", async () => {
                const res = await request(app).get("/photos");
                expect(res.status).toBe(200);
                expect(Array.isArray(res.body)).toBe(true);
        });

        it("GET /photos/:id returns a photo", async () => {
                const res = await request(app).get("/photos/1");
                expect(res.status).toBe(200);
                expect(res.body.id).toBe("1");
        });

        it("POST /photos with no files returns error", async () => {
                const res = await request(app).post("/photos").send({ title: "t", caption: "c" });
                expect(res.status).toBe(400);
                expect(res.body.appError.message).toMatch(/No file/);
        });

        it("DELETE /photos/:filename returns deleted photo", async () => {
                const res = await request(app).delete("/photos/fakehash_full.png");
                expect(res.status).toBe(200);
                expect(res.body.id).toBe("fakehash");
        });
});
