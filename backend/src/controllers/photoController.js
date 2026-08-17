const path = require("path");
const photoService = require("../services/photoService");
const { BadRequestError, ValidationError } = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
exports.getAllPhotos = asyncHandler(async (req, res) => {
        const photos = await photoService.getAllPhotos();
        res.json(photos);
});

exports.getPhotoById = asyncHandler(async (req, res) => {
        const id = req.params.id;
        if (!id) throw new BadRequestError();
        const photo = await photoService.getPhotoById(id);
        res.json(photo);
});

exports.uploadPhoto = asyncHandler(async (req, res) => {
        const { title, caption } = req.body;
        const files = Array.isArray(req.files) ? req.files : [];
        if (files.length === 0) throw new BadRequestError("No files uploaded");
        console.log(files);
        if (title && title.length > 100) throw new ValidationError("Title must be less than 100 characters.");
        if (caption && caption.length > 500) throw new ValidationError("Caption must be less than 500 characters.");

        const photo = await photoService.uploadPhoto(title, caption, files);
        res.json(photo);
});

exports.deletePhoto = asyncHandler(async (req, res) => {
        const filename = req.params.filename;
        if (!filename) throw new BadRequestError("No filename attached to request params");

        const ext = path.extname(filename);
        if (!ext) throw new ValidationError("Invalid filename");

        const photo = await photoService.deletePhoto(filename);
        res.json(photo);
});

exports.editPhoto = asyncHandler(async (req, res) => {
        const filename = req.params.filename;
        if (!filename) throw new BadRequestError("No filename attached to request path");

        const ext = path.extname(filename);
        if (!ext) throw new ValidationError("Invalid filename");

        const { title, caption } = req.body;
        if (title && title.length > 100) throw new ValidationError("Title must be less than 100 characters.");
        if (caption && caption.length > 500) throw new ValidationError("Caption must be less than 500 characters.");

        const photo = await photoService.editPhoto(filename, title, caption);
        res.json(photo);
});
