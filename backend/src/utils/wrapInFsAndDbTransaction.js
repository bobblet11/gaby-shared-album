const { TransactionError } = require("./AppError");
const { FsTransactionClient } = require("./FsTransactionClient");
const os = require("os");
const path = require("path");
const fs = require("fs").promises;
const { randomUUID } = require("crypto");

// EXAMPLE USAGE
// const run = wrapInFsAndDbTransaction(
//         db,
//         async (client, userId, dbClient, fsClient) => {
//                 const res = await client.query("SELECT * FROM users WHERE id=$1", [userId]);
//                 return res.rows[0];
//         },
//         [42],
// );
// run().then(console.log).catch(console.error);

const wrapInFsAndDbTransaction = (db, stagingPath, func, args = []) => {
        const transaction = async () => {
                let dbClient;
                let fsClient;

                try {
                        if (!stagingPath) {
                                const stagingBase = os.tmpdir();
                                stagingPath = path.join(stagingBase, "fs_tx_" + randomUUID());
                                await fs.mkdir(stagingPath, { recursive: true });
                        }

                        fsClient = new FsTransactionClient(stagingPath);
                        dbClient = await db.connect();

                        await fsClient.query("BEGIN");
                        await dbClient.query("BEGIN");

                        const result = await func(...args, fsClient, dbClient);

                        await fsClient.query("COMMIT");
                        await dbClient.query("COMMIT");

                        return result;
                } catch (err) {
                        console.error(err);
                        try {
                                if (dbClient) await dbClient.query("ROLLBACK");
                                if (fsClient) await fsClient.query("ROLLBACK");
                        } catch (rollbackErr) {
                                const failedRollbackMessage = `Transcation Error! Rollback failed: ${rollbackErr.message}`;
                                throw new TransactionError(failedRollbackMessage, err, false);
                        }

                        const successRollbackMessage = `Transcation Error! Rollback successful`;
                        throw new TransactionError(successRollbackMessage, err, true);
                } finally {
                        if (dbClient) dbClient.release();
                        if (stagingPath) {
                                await fs.rm(stagingPath, { recursive: true, force: true });
                        }
                }
        };

        return transaction;
};

module.exports = wrapInFsAndDbTransaction;
