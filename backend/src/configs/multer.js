const path = require("path");
const multer = require("multer");
const config = require("./config");

const storage = multer.diskStorage({
        destination: (req, file, cb) => {
                cb(null, path.join(config.media.basePath, config.media.tempScaleFolder));
        },
        filename: (req, file, cb) => {
                cb(null, Date.now() + "-" + file.originalname);
        },
});
const upload = multer({ storage: storage });
module.exports = upload;
