const path = require("path");
const photoService = require("../services/photoService");
const { BadRequestError, ValidationError } = require("../utils/AppError");

exports.getAllPhotos = async (req, res) => {
        const photos = await photoService.getAllPhotos();
        res.json(photos);
};

exports.getPhotoById = async (req, res) => {
        const id = req.params.id;
        if (!id) throw new BadRequestError();
        const photo = await photoService.getPhotoById(id);
        res.json(photo);
};

exports.uploadPhoto = async (req, res) => {
        const files = req.files;
        const { title, caption } = req.body;

        if (!files || files.length === 0) throw new BadRequestError();
        if (title.length > 100) throw new ValidationError("Title must be less than 100 characters.");
        if (caption.length > 500) throw new ValidationError("Caption must be less than 500 characters.");

        const photo = await photoService.uploadPhoto(title, caption, files);
        res.json(photo);
};

exports.deletePhoto = async (req, res) => {
        const filename = req.params.filename;
        if (!filename) throw new BadRequestError("No filename attached to request params");

        const ext = path.extname(filename);
        if (!ext) throw new ValidationError("Invalid filename");

        const photo = await photoService.deletePhoto(filename);
        res.json(photo);
};

exports.editPhoto = async (req, res) => {
        const filename = req.params.filename;
        if (!filename) throw new BadRequestError("No filename attached to request path");

        const ext = path.extname(filename);
        if (!ext) throw new ValidationError("Invalid filename");

        const { title, caption } = req.body;
        if (title.length > 100) throw new ValidationError("Title must be less than 100 characters.");
        if (caption.length > 500) throw new ValidationError("Caption must be less than 500 characters.");

        const photo = await photoService.editPhoto(filename, title, caption);
        res.json(photo);
};
