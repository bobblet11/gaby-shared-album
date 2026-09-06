const recordRequest = require("../configs/metrics")

const countRequest = async (req, res, next) => {
        recordRequest(req, res);
        next();
};

module.exports = countRequest;
