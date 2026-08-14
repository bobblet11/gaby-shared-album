const getCurrentISODatetime = require("../utils/getCurrentISODatetime");

const logger = (req, res, next) => {
        const timestamp = getCurrentISODatetime();
        const method = req.method;
        const url = req.originalUrl || req.url;

        // stringify body safely
        const body = req.body && Object.keys(req.body).length > 0 ? JSON.stringify(req.body) : "";

        // check for file uploads (multer, busboy, etc.)
        const files = req.files || req.file;
        let fileInfo = "";
        
        if (files) {
                if (Array.isArray(files)) {
                        fileInfo = files.map((f) => f.originalname).join(", ");
                } else if (files.originalname) {
                        fileInfo = files.originalname;
                } else {
                        fileInfo = JSON.stringify(files);
                }
        }

        console.log(`${timestamp} ${method} ${url} body=${body} files=${fileInfo}`);

        next();
};

module.exports = logger;
