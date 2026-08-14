const fs = require("fs").promises;
const fssync = require("fs");
const path = require("path");
const sharp = require("sharp");
const crypto = require("crypto");

const Photo = require("../models/Photo");
const db = require("../configs/db");
const wrapInTransaction = require("../utils/wrapInTransaction");
const getCurrentISODatetime = require("../utils/getCurrentISODatetime");
const { NotFoundError, AppError } = require("../utils/AppError");
const config = require("../configs/config");

exports.getAllPhotos = async () => {
        return await Photo.getAllRows(db, true);
};

exports.getPhotoById = async (id) => {
        const foundPhoto = await Photo.findById(db, id);
        if (foundPhoto === null) throw new NotFoundError(`No Photo with id = ${id}`);
        return foundPhoto;
};

exports.uploadPhoto = async (title, caption, files) => {
        const _ = async (title, caption, files) => {
                const dateTime = getCurrentISODatetime({ hasDate: true, hasTime: true });
                const results = [];

                console.log(title, caption, files);

                for (const file of files) {
                        const tempPath = file.path;
                        const fileBuffer = await fs.readFile(tempPath);

                        // Hash per file
                        const hash = crypto
                                .createHash("sha256")
                                .update(fileBuffer)
                                .update(title || "")
                                .update(caption || "")
                                .update(dateTime)
                                .digest("hex");

                        // Check duplicates
                        const duplicate = await Photo.findById(db, hash);
                        if (duplicate) {
                                await fs.unlink(tempPath);
                                results.push(duplicate);
                                continue;
                        }

                        // File paths
                        const ext = path.extname(file.originalname) || (file.mimetype === "image/png" ? ".png" : ".jpg");
                        const origPath = path.join(config.media.basePath, config.media.originalScaleFolder, `${hash}_orig${ext}`);
                        const fullPath = path.join(config.media.basePath, config.media.fullScaleFolder, `${hash}_full${ext}`);
                        const downPath = path.join(config.media.basePath, config.media.downScaleFolder, `${hash}_down${ext}`);

                        // Write images to disk
                        await fs.rename(tempPath, origPath);
                        // Full scale
                        await sharp(fileBuffer).rotate().withMetadata().resize({ width: 1200 }).jpeg({ quality: 80 }).toFile(fullPath);
                        // Downscale placeholder
                        await sharp(fileBuffer).rotate().withMetadata().resize(20).blur(10).toFile(downPath);

                        // Insert row — if title/caption are empty, store NULL
                        const imageSrc = path.join(config.api.domain, "media", config.media.fullPath, `${hash}_full${ext}`);
                        const placeholderSrc = path.join(config.api.domain, "media", config.media.downScaleFolder, `${hash}_down${ext}`);
                        const insertedPhoto = await Photo.insertPhoto(db, hash, title, caption, dateTime, imageSrc, placeholderSrc);
                        if (insertedPhoto === null) throw new AppError(`Failed to insert photo`);
                        results.push(insertedPhoto);
                }

                return results;
        };

        return await wrapInTransaction(db, _, [title, caption, files])();
};

exports.deletePhoto = async (filename) => {
        const _ = async (filename) => {
                const id = path.basename(filename).split("_")[0];

                const fullPath = path.join(config.media.basePath, config.media.fullScaleFolder, filename);
                const downPath = path.join(config.media.basePath, config.media.downScaleFolder, filename);

                await fs.unlink(fullPath);
                await fs.unlink(downPath);

                const deletedPhoto = await Photo.deletePhoto(db, id);

                if (deletedPhoto === null) throw new NotFoundError(`No Photo with id = ${id}`);
                return deletedPhoto;
        };

        return await wrapInTransaction(db, _, [filename])();
};

exports.editPhoto = async (filename, title, caption) => {
        const _ = async (filename, title = null, caption = null) => {
                const id = path.basename(filename).split("_")[0];
                const editedPhoto = await Photo.editPhoto(db, id, title, caption);
                if (editedPhoto === null) throw new NotFoundError(`No Photo with id = ${id}`);
                return editedPhoto;
        };

        return await wrapInTransaction(db, _, [filename, title, caption])();
};

exports.statusCheck = async () => {
        const tmpPath = path.join(config.media.basePath, config.media.tempScaleFolder);
        const origPath = path.join(config.media.basePath, config.media.originalScaleFolder);
        const fullPath = path.join(config.media.basePath, config.media.fullScaleFolder);
        const downPath = path.join(config.media.basePath, config.media.downScaleFolder);

        for (const dir of [tmpPath, origPath, fullPath, downPath]) {
                if (!fssync.existsSync(dir)) throw new Error("Server cannot start. Media folders do not exist!");
        }
};
