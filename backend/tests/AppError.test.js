// ---- AppError.test.js ----
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { AppError, NotFoundError, BadRequestError, ValidationError, UnauthorizedError, ForbiddenError, TransactionError } = require("../src/utils/AppError");

describe("AppError classes", () => {
        it("AppError defaults to status 500", () => {
                const err = new AppError("Something went wrong");
                assert.equal(err.message, "Something went wrong");
                assert.equal(err.status, 500);
        });

        it("NotFoundError has status 404", () => {
                const err = new NotFoundError();
                assert.equal(err.message, "Resource not found");
                assert.equal(err.status, 404);
        });

        it("BadRequestError has status 400", () => {
                const err = new BadRequestError();
                assert.equal(err.message, "Malformed body");
                assert.equal(err.status, 400);
        });

        it("ValidationError has status 422", () => {
                const err = new ValidationError();
                assert.equal(err.message, "Invalid input");
                assert.equal(err.status, 422);
        });

        it("UnauthorizedError has status 401", () => {
                const err = new UnauthorizedError();
                assert.equal(err.message, "Unauthorized");
                assert.equal(err.status, 401);
        });

        it("ForbiddenError has status 403", () => {
                const err = new ForbiddenError();
                assert.equal(err.message, "Forbidden");
                assert.equal(err.status, 403);
        });

        it("TranscationError has no status", () => {
                const err = new ForbiddenError();
                const transcationError = new TransactionError(undefined, err, true)


                assert.equal(transcationError.message, "Transaction failed");
                assert.equal(transcationError.isRolledBack, true)
                assert.equal(transcationError.appError.message, "Forbidden");
                assert.equal(transcationError.appError.status, 403);
        });
});
