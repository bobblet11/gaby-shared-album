const express = require("express");
const upload = require("../configs/multer");
const { getAllPhotos, getPhotoById, uploadPhoto, deletePhoto, editPhoto } = require("../controllers/photoController");
const recordMetrics = require("../middlewares/recordMetrics");

const router = express.Router();

router.get("/", recordMetrics("photos.getAll"), getAllPhotos);
router.get("/:id", recordMetrics("photos.getById"), getPhotoById);
router.post("/", recordMetrics("photos.upload"), upload.array("image"), uploadPhoto);
router.delete("/:filename", recordMetrics("photos.delete"), deletePhoto);
router.put("/:filename", recordMetrics("photos.edit"), editPhoto);

module.exports = router;
