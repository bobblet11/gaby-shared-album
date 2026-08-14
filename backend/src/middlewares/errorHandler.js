const { TransactionError } = require("../utils/AppError");

const errorHandler = (err, req, res, next) => {
        console.error("=== ERROR HANDLER CAUGHT ===");
        let appError = err;
        let transactionError = null;

        if (err instanceof TransactionError) {
                transactionError = err;
                appError = err.appError;

                console.error("TransactionError:", {
                        message: transactionError.message,
                        rolledBack: transactionError.isRolledBack,
                });

                if (transactionError.appError) {
                        console.error("Wrapped AppError:", {
                                code: transactionError.appError.status,
                                message: transactionError.appError.message,
                                stack: transactionError.appError.stack,
                        });
                }
        } else {
                console.error("AppError:", {
                        code: appError.status,
                        message: appError.message,
                        stack: appError.stack,
                });
        }

        const result = {
                success: false,
                appError: {
                        code: appError?.status || 500,
                        message: appError?.message || "Server Error",
                },
        };

        if (transactionError) {
                result.transactionError = {
                        message: transactionError.message || "Transaction Failed!",
                        isRolledBack: transactionError.isRolledBack,
                };
        }

        res.status(appError?.status || 500).json(result);
};

module.exports = errorHandler;
