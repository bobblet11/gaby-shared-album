const getCurrentISODatetime = require("../utils/getCurrentISODatetime");

const logger = (req, res, next) => {
        console.log(`${getCurrentISODatetime()} ${req.method} ${req.url}`);
        next();
};

module.exports = logger;
