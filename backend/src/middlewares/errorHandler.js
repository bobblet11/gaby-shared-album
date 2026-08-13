const { TransactionError } = require("../utils/AppError");

const errorHandler = (err, req, res, next) => {
        let appError = err;
        let transactionError = null;

        if (err instanceof TransactionError) {
                transactionError = err;
                appError = err.appError;
        }

        const result = {
                success: false,
                appError: {
                        code: appError.status || 500,
                        message: appError.message || "Server Error",
                },
        };

        if (transactionError) {
                result.transactionError = {
                        message: transactionError.message || "Transaction Failed!",
                        isRolledBack: transactionError.isRolledBack,
                };
        }

        res.status(appError.status || 500).json(result);
};

module.exports = errorHandler;
