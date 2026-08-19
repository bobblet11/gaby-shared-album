const { TransactionError } = require("../utils/AppError");
const recordRequest = require("../configs/metrics")

const countRequest = (req, res, next) => {
        recordRequest(req, res);
        next();
};

module.exports = countRequest;
