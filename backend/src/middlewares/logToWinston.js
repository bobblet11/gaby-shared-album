const logger = require("../configs/winston");

const logToWinston = (req, res, next) => {

        const method = req.method;
        const url = req.originalUrl || req.url;
        const body = req.body && Object.keys(req.body).length > 0 ? JSON.stringify(req.body) : null;
        const files = req.files || req.file;

        let fileInfo = null;
        if (files) {
                if (Array.isArray(files)) {
                        fileInfo = files.map((f) => f.originalname).join(", ");
                } else if (files.originalname) {
                        fileInfo = files.originalname;
                } else {
                        fileInfo = JSON.stringify(files);
                }
        }

        const start = Date.now();
        res.on("finish", () => {
                const duration = Date.now() - start;
                logger.info({
                        method,
                        url,
                        status: res.statusCode,
                        duration,
                        body,
                        files: fileInfo,
                });
        });
        
        next();
};

module.exports = logToWinston;
