// logger.js
const winston = require("winston");
const config = require("./config")

const logger = winston.createLogger({
        level: "info",
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        transports: [
                new winston.transports.Console(), // logs to console
                new winston.transports.File({ filename: config.logs.logFilePath }), // logs to file that promtail will tail and send to loki
        ],
});

module.exports = logger;
