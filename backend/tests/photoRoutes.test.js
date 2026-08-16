const { createTestApp } = require("./createTestApp");
const request = require("supertest");

const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");

describe("photoRouter", () => {
        let app;

        beforeEach(() => {
                app = createTestApp();
        });

        it("GET /api/photos returns all photos", async () => {
                const res = await request(app).get("/api/photos");
                console.log(res.body)
                assert.equal(res.status, 200);
                assert.equal(Array.isArray(res.body), true);
        });

        // it("GET /photos/:id returns a photo", async () => {
        //         const res = await request(app).get("/api/photos/1");
        //         assert.equal(res.status, 200);
        //         assert.equal(res.body.id, "1");
        // });

        // it("POST /photos with no files returns error", async () => {
        //         const res = await request(app).post("/photos").send({ title: "t", caption: "c" });
        //         expect(res.status).toBe(400);
        //         expect(res.body.appError.message).toMatch(/No file/);
        // });

        // it("DELETE /photos/:filename returns deleted photo", async () => {
        //         const res = await request(app).delete("/photos/fakehash_full.png");
        //         expect(res.status).toBe(200);
        //         expect(res.body.id).toBe("fakehash");
        // });
});
