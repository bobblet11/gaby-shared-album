const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");

// Mocks
const fs = require("fs").promises;
const fssync = require("fs");
let sharp = require("sharp")
let crypto = require("crypto");
const Photo = require("../src/models/Photo");
const { NotFoundError, AppError, TransactionError } = require("../src/utils/AppError");
const db = require("../src/configs/db");

// Patch dependencies
// We’ll stub methods directly

// Replace actual sharp with stub
const sharpStub = (buf) => ({
        rotate: () => ({
                withMetadata: () => ({
                        resize: () => ({
                                jpeg: () => ({ toFile: async () => {} }),
                                blur: () => ({ toFile: async () => {} }),
                        }),
                }),
        }),
});

// Replace sharp in the require cache
require.cache[require.resolve("sharp")].exports = sharpStub;
// Service under test
const photoService = require("../src/services/photoService");

describe("photoService", () => {
        let mockFile;

        beforeEach(() => {
                // mock image from form
                mockFile = {
                        path: "/tmp/test.png",
                        originalname: "test.png",
                        mimetype: "image/png",
                };

                // Mock fs
                fs.readFile = async () => {
                        Buffer.from("fake-image");
                        console.log("fs just read a file")
                };
                fs.rename = async () => {console.log("fs just renamed a file")};
                fs.unlink = async () => {console.log("fs just unlinked a file")};

                // Mock crypto
                crypto.createHash = function (algorithm) {
                        return {
                                update(data) {
                                        this.calledWithData = data;
                                        return this;
                                },
                                digest(encoding) {
                                        this.calledWithEncoding = encoding;
                                        return "fakehash";
                                },
                        };
                };

                // Mock Photo model
                Photo.getAllRows = async () => [{ id: "1" }, { id: "2" }];
                Photo.findById = async (db, id) => (id === "1" ? { id: "1" } : null);
                Photo.insertPhoto = async () => ({ id: "fakehash", title: "t", caption: "c" });
                Photo.deletePhoto = async () => ({ id: "fakehash" });
                Photo.editPhoto = async () => ({ id: "fakehash", title: "new_title", caption: "new_caption" });

                mockClient = {
                        query: async (sql) => {
                                // Simulate normal rollback success
                                if (sql === "ROLLBACK") return { rows: [] };
                        },

                        // Simulate end of transaction
                        release: () => {},
                };

                db.connect = async () => mockClient;
        });

        it("getAllPhotos returns rows", async () => {
                const rows = await photoService.getAllPhotos();
                assert.deepEqual(rows, [{ id: "1" }, { id: "2" }]);
        });

        it("getPhotoById is successful", async () => {
                // the model will find the photo
                Photo.findById = async (db, id) => {
                        return {
                                id: "1",
                        };
                };

                const photo = await photoService.getPhotoById("1");
                assert.notEqual(photo, null);
                assert.equal(photo.id, "1");
        });

        it("getPhotoById throws NotFoundError if no photo exists", async () => {
                // the model will not find the photo
                Photo.findById = async () => null;
                await assert.rejects(photoService.getPhotoById("1"), (err) => {
                        assert.ok(err instanceof NotFoundError);
                        assert.match(err.message, /No Photo with id = 1/);
                        return true;
                });
        });

        it("uploadPhoto successfully inserts new photo", async () => {
                const [title, caption, files] = ["title", "caption", [mockFile]];
                const result = await photoService.uploadPhoto(title, caption, files);

                assert.equal(result.length, 1);
                assert.equal(result[0].id, "fakehash");
        });

        it("uploadPhoto finds duplicate", async () => {
                const [title, caption, files] = ["title", "caption", [mockFile]];
                Photo.findById = async () => {
                        return { id: "fakehash_dupe", title: title, caption: caption, files: files };
                };
                const result = await photoService.uploadPhoto(title, caption, files);

                assert.equal(result.length, 1);
                assert.equal(result[0].id, "fakehash_dupe");
        });

        it("uploadPhoto successfully inserts 4 new photos", async () => {
                const [title, caption, files] = [null, null, [mockFile, mockFile, mockFile, mockFile]];
                const result = await photoService.uploadPhoto(title, caption, files);

                assert.equal(result.length, 4);
                assert.equal(result[0].id, "fakehash");
                assert.equal(result[1].id, "fakehash");
                assert.equal(result[2].id, "fakehash");
                assert.equal(result[3].id, "fakehash");
        });

        it("uploadPhoto fails to insert new photo, successfully rollback changes, throws transactionError", async () => {
                const [title, caption, files] = ["title", "caption", [mockFile]];
                Photo.insertPhoto = async () => null;

                await assert.rejects(photoService.uploadPhoto(title, caption, files), (err) => {
                        assert.ok(err instanceof TransactionError);
                        assert.match(err.message, /Transcation Error! Rollback successful/);
                        assert.equal(err.isRolledBack, true);

                        assert.ok(err.appError instanceof AppError);
                        assert.match(err.appError.message, /Failed to insert photo/);
                        return true;
                });
        });

        it("uploadPhoto fails to insert new photo, fails to rollback changes, throws transactionError", async () => {
                mockClient = {
                        query: async (sql) => {
                                // Simulate normal rollback success
                                if (sql === "ROLLBACK") throw Error("Failed to Rollback!");
                        },

                        // Simulate end of transaction
                        release: () => {},
                };

                db.connect = async () => mockClient;

                const [title, caption, files] = ["title", "caption", [mockFile]];
                Photo.insertPhoto = async () => null;

                await assert.rejects(photoService.uploadPhoto(title, caption, files), (err) => {
                        assert.ok(err instanceof TransactionError);
                        assert.match(err.message, /Transcation Error! Rollback failed/);
                        assert.equal(err.isRolledBack, false);

                        assert.ok(err.appError instanceof AppError);
                        assert.match(err.appError.message, /Failed to insert photo/);
                        return true;
                });
        });

        it("deletePhoto deletes and returns deleted photo row", async () => {
                const result = await photoService.deletePhoto("fakehash_full.png");
                assert.equal(result.id, "fakehash");
        });

        it("deletePhoto fails because photo does not exist in db, rolls back changes, transaction error thrown", async () => {
                Photo.deletePhoto = async () => null;

                await assert.rejects(photoService.deletePhoto("fakehash_full.png"), (err) => {
                        assert.ok(err instanceof TransactionError);
                        assert.match(err.message, /Transcation Error! Rollback successful/);
                        assert.equal(err.isRolledBack, true);

                        assert.ok(err.appError instanceof NotFoundError);
                        assert.match(err.appError.message, /No Photo with id = fakehash/);
                        return true;
                });
        });

        it("editPhoto edits and returns photo", async () => {
                const result = await photoService.editPhoto("fakehash_full.png", "new_title", "new_caption");
                assert.equal(result.id, "fakehash");
                assert.equal(result.title, "new_title");
                assert.equal(result.caption, "new_caption");
        });

        it("editPhoto fails because photo doesn't exist in db, rollsback, throws transcation error", async () => {
                Photo.editPhoto = async () => null;
                await assert.rejects(photoService.editPhoto("fakehash_full.png", "new_title", "new_caption"), (err) => {
                        assert.ok(err instanceof TransactionError);
                        assert.match(err.message, /Transcation Error! Rollback successful/);
                        assert.equal(err.isRolledBack, true);

                        assert.ok(err.appError instanceof NotFoundError);
                        assert.match(err.appError.message, /No Photo with id = fakehash/);
                        return true;
                });
        });

        it("statusCheck throws if folder missing", async () => {
                fssync.existsSync = () => false;
                await assert.rejects(photoService.statusCheck(), (err) => {
                        assert.match(err.message, /Server cannot start. Media folders do not exist!/);
                        return true;
                });
        });
});
