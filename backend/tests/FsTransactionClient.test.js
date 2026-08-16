const { describe, it, before, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const fs = require("fs").promises;
const { randomUUID } = require("node:crypto");

const { FsOperation, FsTransactionClient } = require("../src/utils/FsTransactionClient");

describe("FsOperation", () => {
        let stagingDir;
        let resultDir;
        let testFile;
        let operationDirectory;

        before(async () => {
                stagingDir = path.join(__dirname, "tmp_staging_1");
                resultDir = path.join(__dirname, "result_1");
                testFile = path.join(resultDir, "testFile.txt");

                // only create dirs if missing
                await fs.rm(stagingDir, { recursive: true, force: true });
                await fs.rm(resultDir, { recursive: true, force: true });

                await fs.mkdir(stagingDir, { recursive: true });
                await fs.mkdir(resultDir, { recursive: true });

                // ensure a test file exists
                await fs.writeFile(testFile, "dummy content");
        });

        beforeEach(async () => {
                console.log("------------------");
                testFile = path.join(resultDir, "testFile.txt");
                await fs.writeFile(testFile, "transaction content");
                operationDirectory = path.join(stagingDir, randomUUID());
                await fs.mkdir(operationDirectory, { recursive: true });
        });

        it("prepare creates staging copy for rename", async () => {
                const destFile = path.join(resultDir, "renamed.prepare.txt");
                const op = new FsOperation("rename", { inputPath: testFile, outputPath: destFile });

                await op.prepare(operationDirectory);
                console.log("Prepared:", { prepared: op.prepared, committed: op.committed });

                // should have copied files into a staging directory
                const entries = await fs.readdir(operationDirectory);
                console.log("Staging contents after prepare:", entries);

                assert.equal(entries.length, 1);
        });

        it("rollback prepared file removes staging file", async () => {
                const destFile = path.join(resultDir, "renamed.txt");
                const op = new FsOperation("rename", { inputPath: testFile, outputPath: destFile });
                await op.prepare(operationDirectory);
                // should have created files in staging
                let entries = await fs.readdir(operationDirectory);
                console.log("Before rollback", entries);
                assert.equal(entries.length, 1);

                // should have deleted all files in staging
                await op.rollback();
                entries = await fs.readdir(operationDirectory);
                console.log("After rollback:", await fs.readdir(operationDirectory));
                assert.equal(entries.length, 0);
        });

        it("commit rename then rollback", async () => {
                const destFile = path.join(resultDir, "renamed.txt");
                const op = new FsOperation("rename", { inputPath: testFile, outputPath: destFile });

                await op.prepare(operationDirectory);

                // should have created files in staging
                let entriesInResult = await fs.readdir(resultDir);
                console.log("After prepare rename (in results)", entriesInResult);
                assert.equal(entriesInResult.length, 1);
                assert.equal(entriesInResult[0], "testFile.txt");

                let entries = await fs.readdir(operationDirectory);
                console.log("After prepare rename (in staging)", entries);
                assert.equal(entries.length, 1);

                // should still exist in staging. new file in destination
                await op.execute();
                entries = await fs.readdir(operationDirectory);
                console.log("After commit rename (in staging)", entries);
                assert.equal(entries.length, 1);

                entriesInResult = await fs.readdir(resultDir);
                console.log("After commit rename (in results)", entriesInResult);
                assert.equal(entriesInResult.length, 1);
                assert.equal(entriesInResult[0], "renamed.txt");

                await op.rollback();
                entries = await fs.readdir(operationDirectory);
                console.log("After rollback rename (in staging)", entries);
                assert.equal(entries.length, 0);

                entriesInResult = await fs.readdir(resultDir);
                console.log("After rollback rename (in results)", entriesInResult);
                assert.equal(entriesInResult.length, 1);
                assert.equal(entriesInResult[0], "testFile.txt");
        });
});

describe("FsTransactionClient", () => {
        let stagingDir;
        let testFile;
        let resultDir;

        before(async () => {
                stagingDir = path.join(__dirname, "tmp_staging_2");
                resultDir = path.join(__dirname, "result_2");

                // only create dirs if missing
                await fs.rm(stagingDir, { recursive: true, force: true });
                await fs.rm(resultDir, { recursive: true, force: true });

                await fs.mkdir(stagingDir, { recursive: true });
                await fs.mkdir(resultDir, { recursive: true });
        });

        beforeEach(async () => {
                testFile = path.join(resultDir, "testFile.txt");
                await fs.writeFile(testFile, "transaction content");
                const destFile = path.join(resultDir, "renamed.txt");
                await fs.rm(destFile, { force: true });
                console.log("------------------");
        });

        it("BEGIN → QUEUE → COMMIT", async () => {
                // create a new operationsDirectory

                const client = new FsTransactionClient(stagingDir);
                await client.query("BEGIN");
                console.log("Status after BEGIN:", client.status);

                let entriesInResult = await fs.readdir(resultDir);
                console.log("Before transaction (in results)", entriesInResult);
                assert.equal(entriesInResult.length, 1);
                assert.equal(entriesInResult[0], "testFile.txt");

                const operationDirectory = client.operationDirectory;
                let isStagingExists = false;
                try {
                        // Get file stats
                        const stats = await fs.stat(operationDirectory);
                        isStagingExists = stats.isDirectory(); // true if it's a directory
                } catch (err) {
                        if (err.code === "ENOENT") {
                                isStagingExists = false; // Directory does not exist
                        }
                        throw err;
                }
                console.log(`dies staging directory exist? ${isStagingExists}`);
                assert.equal(isStagingExists, true);

                let entries = await fs.readdir(operationDirectory);
                console.log("Before transaction (in staging)", entries);
                assert.equal(entries.length, 0);

                const destFile = path.join(resultDir, "renamed.txt");
                const op = new FsOperation("rename", { inputPath: testFile, outputPath: destFile });
                await client.query("QUEUE", op);
                console.log(
                        "Queued ops:",
                        client.stagedOperations.map((o) => o.op),
                );

                entriesInResult = await fs.readdir(resultDir);
                console.log("After queue transaction (in results)", entriesInResult);
                assert.equal(entriesInResult.length, 1);
                assert.equal(entriesInResult[0], "testFile.txt");

                entries = await fs.readdir(client.operationDirectory);
                console.log("After queue transaction (in staging)", entries);
                assert.equal(entries.length, 0);

                try {
                        await client.query("COMMIT");
                } catch (err) {
                        console.log("Commit error:", err.message);
                }

                isStagingExists = false;
                try {
                        // Get file stats
                        const stats = await fs.stat(operationDirectory);
                        isStagingExists = stats.isDirectory(); // true if it's a directory
                } catch (err) {
                        isStagingExists = false;
                }
                assert.equal(isStagingExists, false);
                console.log(`dies staging directory exist? ${isStagingExists}`);

                entriesInResult = await fs.readdir(resultDir);
                console.log("After commit transaction (in results)", entriesInResult);
                assert.equal(entriesInResult.length, 1);
                assert.equal(entriesInResult[0], "renamed.txt");

                console.log("Status after COMMIT:", client.status);
                console.log(
                        "Committed ops:",
                        client.committedOperations.map((o) => o.op),
                );
        });

        it("BEGIN → QUEUE → PREPARE -> COMMIT -> ERROR. Rollback after prepare", async () => {
                // create a new operationsDirectory
                FsOperation.execute = async () => {
                        throw new Error("Test fail");
                };

                const client = new FsTransactionClient(stagingDir);
                await client.query("BEGIN");
                console.log("Status after BEGIN:", client.status);

                let entriesInResult = await fs.readdir(resultDir);
                console.log("Before transaction (in results)", entriesInResult);
                assert.equal(entriesInResult.length, 1);
                assert.equal(entriesInResult[0], "testFile.txt");

                const operationDirectory = client.operationDirectory;
                let isStagingExists = false;
                try {
                        // Get file stats
                        const stats = await fs.stat(operationDirectory);
                        isStagingExists = stats.isDirectory(); // true if it's a directory
                } catch (err) {
                        if (err.code === "ENOENT") {
                                isStagingExists = false; // Directory does not exist
                        }
                        throw err;
                }
                console.log(`does staging directory exist? ${isStagingExists}`);
                assert.equal(isStagingExists, true);

                let entries = await fs.readdir(operationDirectory);
                console.log("Before transaction (in staging)", entries);
                assert.equal(entries.length, 0);

                const destFile = path.join(resultDir, "renamed.txt");
                const op = new FsOperation("rename", { inputPath: testFile, outputPath: destFile });
                await client.query("QUEUE", op);
                console.log(
                        "Queued ops:",
                        client.stagedOperations.map((o) => o.op),
                );

                entriesInResult = await fs.readdir(resultDir);
                console.log("After queue transaction (in results)", entriesInResult);
                assert.equal(entriesInResult.length, 1);
                assert.equal(entriesInResult[0], "testFile.txt");

                entries = await fs.readdir(client.operationDirectory);
                console.log("After queue transaction (in staging)", entries);
                assert.equal(entries.length, 0);

                try {
                        await client.query("COMMIT");
                } catch (err) {
                        console.log("Commit error:", err.message);
                        await client.query("ROLLBACK");

                        isStagingExists = false;
                        try {
                                // Get file stats
                                const stats = await fs.stat(operationDirectory);
                                isStagingExists = stats.isDirectory(); // true if it's a directory
                        } catch (err) {
                                isStagingExists = false;
                        }
                        assert.equal(isStagingExists, false);
                        console.log(`dies staging directory exist after rollback? ${isStagingExists}`);

                        entriesInResult = await fs.readdir(resultDir);
                        console.log("After ROLLBACK transaction (in results)", entriesInResult);
                        assert.equal(entriesInResult.length, 1);
                        assert.equal(entriesInResult[0], "testFile.txt");

                        console.log("Status after ROLLBACK:", client.status);
                        console.log(
                                "Committed ops:",
                                client.committedOperations.map((o) => o.op),
                        );
                }
        });

        it("BEGIN → QUEUE → PREPARE -> ERROR. Rollback after prepare", async () => {
                const oldRm = fs.rm;
                // create a new operationsDirectory
                fs.rm = async () => {
                        throw new Error("Test fail");
                };

                const client = new FsTransactionClient(stagingDir);
                await client.query("BEGIN");
                console.log("Status after BEGIN:", client.status);

                let entriesInResult = await fs.readdir(resultDir);
                console.log("Before transaction (in results)", entriesInResult);
                assert.equal(entriesInResult.length, 1);
                assert.equal(entriesInResult[0], "testFile.txt");

                const operationDirectory = client.operationDirectory;
                let isStagingExists = false;
                try {
                        // Get file stats
                        const stats = await fs.stat(operationDirectory);
                        isStagingExists = stats.isDirectory(); // true if it's a directory
                } catch (err) {
                        if (err.code === "ENOENT") {
                                isStagingExists = false; // Directory does not exist
                        }
                        throw err;
                }
                console.log(`does staging directory exist? ${isStagingExists}`);
                assert.equal(isStagingExists, true);

                let entries = await fs.readdir(operationDirectory);
                console.log("Before transaction (in staging)", entries);
                assert.equal(entries.length, 0);

                const destFile = path.join(resultDir, "renamed.txt");
                const op = new FsOperation("rename", { inputPath: testFile, outputPath: destFile });
                await client.query("QUEUE", op);
                console.log(
                        "Queued ops:",
                        client.stagedOperations.map((o) => o.op),
                );

                entriesInResult = await fs.readdir(resultDir);
                console.log("After queue transaction (in results)", entriesInResult);
                assert.equal(entriesInResult.length, 1);
                assert.equal(entriesInResult[0], "testFile.txt");

                entries = await fs.readdir(client.operationDirectory);
                console.log("After queue transaction (in staging)", entries);
                assert.equal(entries.length, 0);

                try {
                        await client.query("COMMIT");
                } catch (err) {
                        fs.rm = oldRm;
                        console.log("Commit error:", err.message);
                        await client.query("ROLLBACK");

                        isStagingExists = false;
                        try {
                                // Get file stats
                                const stats = await fs.stat(operationDirectory);
                                isStagingExists = stats.isDirectory(); // true if it's a directory
                        } catch (err) {
                                isStagingExists = false;
                        }
                        assert.equal(isStagingExists, false);
                        console.log(`dies staging directory exist after rollback? ${isStagingExists}`);

                        entriesInResult = await fs.readdir(resultDir);
                        console.log("After ROLLBACK transaction (in results)", entriesInResult);
                        assert.equal(entriesInResult.length, 1);
                        assert.equal(entriesInResult[0], "testFile.txt");

                        console.log("Status after ROLLBACK:", client.status);
                        console.log(
                                "Committed ops:",
                                client.committedOperations.map((o) => o.op),
                        );
                }
        });
});
