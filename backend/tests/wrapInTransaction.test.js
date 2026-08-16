const { describe, it, beforeEach } = require("node:test");
const assert = require("node:assert/strict");

const wrapInTransaction = require("../src/utils/wrapInTransaction");
const { AppError, TransactionError } = require("../src/utils/AppError");

describe("wrapInTransaction", () => {
        let mockDb, mockClient;

        beforeEach(() => {
                mockClient = {
                        query: async (sql) => {
                                // Simulate normal rollback success
                                if (sql === "ROLLBACK") return { rows: [] };

                                // Simulate normal query success (every query should return some rows)
                                return { rows: [{ id: 42 }] };
                        },

                        // Simulate end of transaction
                        release: () => {},
                };
                mockDb = {
                        connect: async () => mockClient,
                };
        });

        it("Function body succeeds causing a commit. Returns result after commit", async () => {
                const successfulDbQuery = async (client, userId) => {
                        const res = await client.query("SELECT $1::int as id", [userId]);
                        return res.rows[0];
                };

                const run = wrapInTransaction(mockDb, successfulDbQuery, [42]);

                // result should contain the rows returned from the db query
                const result = await run();
                assert.deepEqual(result, { id: 42 });
        });

        it("Function body fails causing a roll back. Throws TransactionError with successful rollback", async () => {
                const unsuccessfulDbQuery = async () => {
                        throw new AppError("Test failure");
                };

                const run = wrapInTransaction(mockDb, unsuccessfulDbQuery, []);

                await assert.rejects(run(), (err) => {
                        assert.ok(err instanceof TransactionError);
                        assert.match(err.message, /Transcation Error! Rollback successful/);
                        assert.equal(err.isRolledBack, true);
                        
                        assert.ok(err.appError instanceof AppError);
                        assert.equal(err.appError.status, 500);
                        assert.match(err.appError.message, /Test failure/);
                        return true;
                });
        });

        it("Function body fails causing a roll back. Roll back fails. Throws a AppError caught by failed roll back", async () => {
                const unsuccessfulDbQuery = async () => {
                        throw new AppError("Test failure");
                };

                // Patch query to fail on rollback
                mockClient.query = async (sql) => {
                        if (sql === "ROLLBACK") throw new Error("Rollback failure test");
                };

                const run = wrapInTransaction(mockDb, unsuccessfulDbQuery, []);

                await assert.rejects(run(), (err) => {
                        assert.ok(err instanceof TransactionError);
                        assert.match(err.message, /Transcation Error! Rollback failed: Rollback failure test/);
                        assert.equal(err.isRolledBack, false);

                        assert.ok(err.appError instanceof AppError);
                        assert.equal(err.appError.status, 500);
                        assert.match(err.appError.message, /Test failure/);

                        return true;
                });
        });
});
