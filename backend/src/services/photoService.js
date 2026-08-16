const fs = require("fs").promises;
const fssync = require("fs");
const path = require("path");
const crypto = require("crypto");

const Photo = require("../models/Photo");
const db = require("../configs/db");
const wrapInFsAndDbTransaction = require("../utils/wrapInFsAndDbTransaction");
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
        const _ = async (title, caption, files, fsClient, dbClient) => {
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
                        const duplicate = await Photo.findById(dbClient, hash);
                        if (duplicate) {
                                await fsClient.query("unlink", { inputPath: tempPath });
                                // await fs.unlink(tempPath);
                                results.push(duplicate);
                                continue;
                        }

                        // File paths
                        let ext = path.extname(file.originalname).toLowerCase();
                        if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") {
                                ext = ".jpg";
                        }
                        const origPath = path.join(config.media.basePath, config.media.originalScaleFolder, `${hash}_orig${ext}`);
                        const fullPath = path.join(config.media.basePath, config.media.fullScaleFolder, `${hash}_full${ext}`);
                        const downPath = path.join(config.media.basePath, config.media.downScaleFolder, `${hash}_down${ext}`);

                        // Write images to disk
                        await fsClient.query("rename", { inputPath: tempPath, outputPath: origPath });
                        // await fs.rename(tempPath, origPath);

                        if (ext === ".png") {
                                await fsClient.query("sharp", { inputPath: origPath, outputPath: fullPath, rotate: true, withMetadata: true, resize: { width: 1200 }, format: "png" });
                                await fsClient.query("sharp", { inputPath: origPath, outputPath: downPath, rotate: true, withMetadata: true, resize: { width: 20, height: 20 }, blur: 10, format: "png" });
                                // await sharp(fileBuffer).rotate().withMetadata().resize({ width: 1200 }).png().toFile(fullPath);
                                // await sharp(fileBuffer).rotate().withMetadata().resize(20).blur(10).png().toFile(downPath);
                        } else {
                                await fsClient.query("sharp", { inputPath: origPath, outputPath: fullPath, rotate: true, withMetadata: true, resize: { width: 1200 }, format: "jpeg", quality: 80 });
                                await fsClient.query("sharp", { inputPath: origPath, outputPath: downPath, rotate: true, withMetadata: true, resize: { width: 20, height: 20 }, blur: 10, format: "jpeg", quality: 80 });
                                // await sharp(fileBuffer).rotate().withMetadata().resize({ width: 1200 }).jpeg({ quality: 80 }).toFile(fullPath);
                                // await sharp(fileBuffer).rotate().withMetadata().resize(20).blur(10).jpeg({ quality: 80 }).toFile(downPath);
                        }

                        // Insert row — if title/caption are empty, store NULL
                        const imageSrc = `${config.api.domain}/media/${config.media.fullScaleFolder}/${hash}_full${ext}`;
                        const placeholderSrc = `${config.api.domain}/media/${config.media.downScaleFolder}/${hash}_down${ext}`;

                        const insertedPhoto = await Photo.insertPhoto(dbClient, hash, title, caption, imageSrc, placeholderSrc);
                        if (insertedPhoto === null) throw new AppError(`Failed to insert photo`);
                        results.push(insertedPhoto);
                }

                return results;
        };

        return await wrapInFsAndDbTransaction(db, undefined, _, [title, caption, files])();
};

exports.deletePhoto = async (filename) => {
        //NOT ACTUALLY A TRANSACTION. FILE OPERATIONS ARE NOT TRANSCATIONAL! ONLY POSTGRES OPERATIONS WILL BE ROLLBACKED
        // todo: implement file transaction system
        const _ = async (filename, fsClient, dbClient) => {
                const id = path.basename(filename).split("_")[0];
                const ext = path.extname(filename);

                const fullPath = path.join(config.media.basePath, config.media.fullScaleFolder, `${id}_full${ext}`);
                const downPath = path.join(config.media.basePath, config.media.downScaleFolder, `${id}_down${ext}`);

                await fsClient.query("unlink", { inputPath: fullPath });
                await fsClient.query("unlink", { inputPath: downPath });

                const deletedPhoto = await Photo.deletePhoto(dbClient, id);

                if (deletedPhoto === null) throw new NotFoundError(`No Photo with id = ${id}`);
                return deletedPhoto;
        };

        return await wrapInFsAndDbTransaction(db, undefined, _, [filename])();
};

exports.editPhoto = async (filename, title, caption) => {
        const _ = async (filename, title = null, caption = null, _, dbClient) => {
                const id = path.basename(filename).split("_")[0];
                const editedPhoto = await Photo.editPhoto(dbClient, id, title, caption);
                if (editedPhoto === null) throw new NotFoundError(`No Photo with id = ${id}`);
                return editedPhoto;
        };

        return await wrapInFsAndDbTransaction(db, undefined, _, [filename, title, caption])();
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
