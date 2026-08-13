const { TransactionError } = require("./AppError");

// EXAMPLE USAGE
// const run = wrapInTransaction(
//         db,
//         async (client, userId) => {
//                 const res = await client.query("SELECT * FROM users WHERE id=$1", [userId]);
//                 return res.rows[0];
//         },
//         [42],
// );
// run().then(console.log).catch(console.error);

const wrapInTransaction = (db, func, args = []) => {
        const transaction = async () => {
                let transactionClient;
                try {
                        transactionClient = await db.connect();
                        await transactionClient.query("BEGIN");

                        const result = await func(...args, wrapInTransaction);

                        await transactionClient.query("COMMIT");
                        return result;
                } catch (err) {
                        if (transactionClient) {
                                try {
                                        await transactionClient.query("ROLLBACK");
                                } catch (rollbackErr) {
                                        const failedRollbackMessage = `Transcation Error! Rollback failed: ${rollbackErr.message}`
                                        throw new TransactionError(failedRollbackMessage, err, false);
                                }
                        }
                        const successRollbackMessage = `Transcation Error! Rollback successful`;
                        throw new TransactionError(successRollbackMessage, err, true);
                } finally {
                        if (transactionClient) transactionClient.release();
                }
        };

        return transaction;
};

module.exports = wrapInTransaction;
