class AppError extends Error {
        constructor(message, status) {
                super(message);
                this.status = status || 500;
                Error.captureStackTrace(this, this.constructor);
        }
}

class NotFoundError extends AppError {
        constructor(message = "Resource not found") {
                super(message, 404);
        }
}

class BadRequestError extends AppError {
        constructor(message = "Malformed body") {
                super(message, 400);
        }
}

class ValidationError extends AppError {
        constructor(message = "Invalid input") {
                super(message, 422);
        }
}

class UnauthorizedError extends AppError {
        constructor(message = "Unauthorized") {
                super(message, 401);
        }
}

class ForbiddenError extends AppError {
        constructor(message = "Forbidden") {
                super(message, 403);
        }
}

class TransactionError extends Error {
        constructor(message = "Transaction failed", subError, isRolledBack) {
                super(message);
                this.isRolledBack = isRolledBack;
                this.appError = subError;
                Error.captureStackTrace(this, this.constructor);
        }
}

module.exports = {
        AppError,
        NotFoundError,
        ValidationError,
        UnauthorizedError,
        ForbiddenError,
        BadRequestError,
        TransactionError,
};
