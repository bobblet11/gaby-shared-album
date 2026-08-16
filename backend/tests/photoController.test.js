const { describe, it, beforeEach } = require("node:test");
const assert = require("node:assert/strict");

// Import the controller
const photoController = require("../src/controllers/photoController");

// Mock photoService
const photoService = require("../src/services/photoService");

// Replace methods with stubs before each test
beforeEach(() => {
        photoService.getAllPhotos = async () => [{ id: "1" }];
        photoService.getPhotoById = async (id) => ({ id });
        photoService.uploadPhoto = async (title, caption, files) => [{ id: "fakehash" }];
        photoService.deletePhoto = async (filename) => ({ id: "fakehash" });
        photoService.editPhoto = async (filename, title, caption) => ({ id: "fakehash", title, caption });
});

// Helper to mock res
function createMockRes() {
        return {
                jsonCalledWith: null,
                statusCode: null,
                json(data) {
                        this.jsonCalledWith = data;
                },
                status(code) {
                        this.statusCode = code;
                        return this;
                },
        };
}

describe("photoController", () => {
        it("getAllPhotos returns photos", async () => {
                const req = {};
                const res = createMockRes();

                await photoController.getAllPhotos(req, res);

                assert.deepEqual(res.jsonCalledWith, [{ id: "1" }]);
        });

        it("getPhotoById returns photo", async () => {
                const req = { params: { id: "123" } };
                const res = createMockRes();

                await photoController.getPhotoById(req, res);

                assert.equal(res.jsonCalledWith.id, "123");
        });

        it("uploadPhoto returns uploaded photo", async () => {
                const req = { body: { title: "t", caption: "c" }, files: [{ path: "f.png" }] };
                const res = createMockRes();

                await photoController.uploadPhoto(req, res);

                assert.equal(res.jsonCalledWith[0].id, "fakehash");
        });

        it("deletePhoto returns deleted photo", async () => {
                const req = { params: { filename: "fakehash_full.png" } };
                const res = createMockRes();

                await photoController.deletePhoto(req, res);

                assert.equal(res.jsonCalledWith.id, "fakehash");
        });

        it("editPhoto returns edited photo", async () => {
                const req = { params: { filename: "fakehash_full.png" }, body: { title: "new", caption: "new" } };
                const res = createMockRes();

                await photoController.editPhoto(req, res);

                assert.equal(res.jsonCalledWith.title, "new");
                assert.equal(res.jsonCalledWith.caption, "new");
        });
});
