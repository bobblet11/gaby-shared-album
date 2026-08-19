const express = require("express");
const upload = require("../configs/multer")
const { getAllPhotos, getPhotoById, uploadPhoto, deletePhoto, editPhoto } = require("../controllers/photoController");

const router = express.Router();


router.get("/", getAllPhotos);
router.get("/:id", getPhotoById);
router.post("/", upload.array("image"), uploadPhoto);
router.delete("/:filename", deletePhoto);
router.put("/:filename", editPhoto)

module.exports = router;
