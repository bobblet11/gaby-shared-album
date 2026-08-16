const assert = require("node:assert/strict");
const path = require("path");
const { randomUUID } = require("node:crypto");
const fs = require("fs").promises;
const sharp = require("sharp");

class FsOperation {
        static SUPPORTED_OPERATIONS = new Set(["sharp", "unlink", "rename"]);
        static IMAGE_FORMATS = new Set(["jpeg", "png"]);

        constructor(action, operationArguments) {
                this.op = action;
                this.args = structuredClone(operationArguments ?? {});
                this.absTempOutput = null;
                this.prepared = false;
                this.committed = false;
                console.log(`[FsOperation] Constructed op=${this.op}`, this.args);
                this.validate();
        }

        static resolvePath(value, name) {
                assert.equal(typeof value, "string", `${name} must be a string`);
                assert.ok(value.trim().length > 0, `${name} must not be empty`);
                return path.resolve(value);
        }

        static validateOptionalBoolean(value, name) {
                if (value !== undefined) {
                        assert.equal(typeof value, "boolean", `${name} must be a boolean`);
                }
        }

        static validateOptionalNumber(value, name, { min = -Infinity, max = Infinity } = {}) {
                if (value !== undefined) {
                        assert.equal(typeof value, "number", `${name} must be a number`);

                        assert.ok(Number.isFinite(value), `${name} must be finite`);

                        assert.ok(value >= min, `${name} must be >= ${min}`);

                        assert.ok(value <= max, `${name} must be <= ${max}`);
                }
        }

        validate() {
                console.log(`[FsOperation] Validating op=${this.op}, args=${this.args}`);
                assert.ok(FsOperation.SUPPORTED_OPERATIONS.has(this.op), `Unsupported filesystem operation: ${this.op}`);
                assert.ok(this.args && typeof this.args === "object" && !Array.isArray(this.args), "operation arguments must be an object");
                switch (this.op) {
                        case "sharp":
                                this.validateSharp();
                                break;

                        case "unlink":
                                this.validateUnlink();
                                break;

                        case "rename":
                                this.validateRename();
                                break;

                        default:
                                throw new Error(`Unsupported operation: ${this.op}`);
                }
        }

        validateSharp() {
                const args = this.args;

                args.inputPath = FsOperation.resolvePath(args.inputPath, "inputPath");
                args.outputPath = FsOperation.resolvePath(args.outputPath, "outputPath");

                assert.notEqual(args.inputPath, args.outputPath, "inputPath and outputPath must be different");

                assert.equal(typeof args.format, "string", "format must be a string");

                assert.ok(FsOperation.IMAGE_FORMATS.has(args.format), "format must be jpeg or png");

                FsOperation.validateOptionalBoolean(args.withMetadata, "withMetadata");

                if (args.rotate !== undefined) {
                        assert.ok(typeof args.rotate === "boolean" || typeof args.rotate === "number", "rotate must be a boolean or number");

                        if (typeof args.rotate === "number") {
                                assert.ok(Number.isFinite(args.rotate), "rotate must be finite");
                        }
                }

                if (args.resize !== undefined) {
                        assert.ok(args.resize && typeof args.resize === "object" && !Array.isArray(args.resize), "resize must be an object");

                        const { width, height } = args.resize;

                        assert.ok(width !== undefined || height !== undefined, "resize must contain width or height");

                        FsOperation.validateOptionalNumber(width, "resize.width", { min: 1 });

                        FsOperation.validateOptionalNumber(height, "resize.height", { min: 1 });
                }

                if (args.blur !== undefined) {
                        FsOperation.validateOptionalNumber(args.blur, "blur", { min: 1, max: 100 });
                }

                if (args.format === "jpeg") {
                        assert.equal(typeof args.quality, "number", "quality must be a number for jpeg");

                        assert.ok(Number.isFinite(args.quality), "quality must be finite");

                        assert.ok(args.quality >= 1 && args.quality <= 100, "quality must be between 1 and 100");
                } else {
                        assert.ok(args.quality === undefined, "quality is only valid for jpeg");
                }
        }

        validateUnlink() {
                const args = this.args;
                args.inputPath = FsOperation.resolvePath(args.inputPath, "inputPath");
        }

        validateRename() {
                const args = this.args;

                args.inputPath = FsOperation.resolvePath(args.inputPath, "inputPath");

                args.outputPath = FsOperation.resolvePath(args.outputPath, "outputPath");

                assert.notEqual(args.inputPath, args.outputPath, "inputPath and outputPath must be different");
        }

        async prepare(stagingDirectory) {
                console.log(`[FsOperation] Preparing op=${this.op} stagingDir=${stagingDirectory}`);
                //move file from input to staging
                if (this.prepared) {
                        throw new Error(`This operation (${this.op}) is already prepared`);
                }
                if (this.committed) {
                        throw new Error(`This operation (${this.op}) is already comitted`);
                }

                let ext = path.extname(this.args.inputPath);
                if (this.op === "sharp") ext = this.args.format;

                const stagedFilename = `preparation.${randomUUID()}.${ext}`;
                const absTempOutput = path.join(stagingDirectory, stagedFilename);

                await fs.mkdir(path.dirname(absTempOutput), {
                        recursive: true,
                });

                this.absTempOutput = absTempOutput;

                switch (this.op) {
                        case "sharp":
                                // await this.prepareSharp(absTempOutput);
                                break;
                        case "unlink":
                        case "rename":
                                await fs.copyFile(this.args.inputPath, absTempOutput);
                                break;

                        default:
                                throw new Error(`Unsupported operation: ${this.op}`);
                }
                this.prepared = true;
                console.log(`[FsOperation] Prepared op=${this.op} temp=${this.absTempOutput}`);
        }

        async execute() {
                console.log(`[FsOperation] Executing op=${this.op}`);
                //move file from staging to final
                if (!this.prepared) {
                        throw new Error(`This operation (${this.op}) is not prepared`);
                }
                if (this.committed) {
                        throw new Error(`This operation (${this.op}) is already comitted`);
                }

                switch (this.op) {
                        case "sharp":
                                await this.executeSharp(this.absTempOutput);
                                await fs.copyFile(this.absTempOutput, this.args.outputPath);
                                break;

                        case "unlink":
                                await fs.unlink(this.args.inputPath);
                                break;

                        case "rename":
                                await fs.copyFile(this.args.inputPath, this.args.outputPath);
                                await fs.unlink(this.args.inputPath);
                                break;

                        default:
                                throw new Error(`Unsupported operation: ${this.op}`);
                }
                this.committed = true;
                console.log(`[FsOperation] Executed op=${this.op} output=${this.args.outputPath}`);
        }

        async executeSharp(outputPath) {
                const args = this.args;
                const pipeline = sharp(args.inputPath);

                if (args.rotate !== undefined) {
                        pipeline.rotate(args.rotate === true ? undefined : args.rotate);
                }

                if (args.withMetadata === true) {
                        pipeline.withMetadata();
                }

                if (args.resize !== undefined) {
                        pipeline.resize(args.resize);
                }

                if (args.blur !== undefined) {
                        pipeline.blur(args.blur);
                }

                if (args.format === "jpeg") {
                        pipeline.jpeg({
                                quality: args.quality,
                        });
                } else {
                        pipeline.png();
                }

                return await pipeline.toFile(outputPath);
        }

        async rollback() {
                console.log(`[FsOperation] Rolling back op=${this.op}`);
                if (!this.absTempOutput) {
                        return;
                }

                if (!this.prepared && !this.committed) {
                        throw new Error(`This operation (${this.op}) is not prepared or committed, should not be rolled back`);
                }

                //All that has happened is a file copy was created in staging. So just clear staging
                if (this.prepared && !this.committed) {
                        switch (this.op) {
                                case "sharp":
                                        break;
                                case "unlink":
                                case "rename":
                                        await fs.rm(this.absTempOutput, {
                                                force: true,
                                        });
                                        break;
                                default:
                                        throw new Error(`Unsupported operation: ${this.op}`);
                        }
                }

                //Filesystem has somehow been modified, recover it using the saved files in staging
                if (this.prepared && this.committed) {
                        switch (this.op) {
                                case "sharp":
                                        await fs.unlink(this.absTempOutput);
                                        await fs.unlink(this.args.outputPath);
                                        break;
                                case "unlink":
                                        //file at input has been removed, copy still exists, recover it
                                        await fs.copyFile(this.absTempOutput, this.args.inputPath);
                                        await fs.unlink(this.absTempOutput);
                                        break;
                                case "rename":
                                        //file at input has been removed, and new file has been copied over to destination. copy in staging still exists
                                        //delete copy at destintation, recover file at input, clean staging
                                        await fs.unlink(this.args.outputPath);
                                        await fs.copyFile(this.absTempOutput, this.args.inputPath);
                                        await fs.unlink(this.absTempOutput);
                                        break;
                                default:
                                        throw new Error(`Unsupported operation: ${this.op}`);
                        }
                }

                this.prepared = false;
                this.committed = false;
                console.log(`[FsOperation] Rolled back committed op=${this.op}`);
        }
}

class FsTransactionClient {
        static SUPPORTED_STATUSES = new Set(["idle", "active", "preparing", "prepared", "committing", "failed_prepare", "failed_commit", "failed_rollback", "rolled_back", "committed"]);

        constructor(stagingPath) {
                this.stagedOperations = [];
                this.preparedOperations = [];
                this.committedOperations = [];
                this.status = "idle";
                this.stagingPath = stagingPath;
                this.operationDirectory;
                console.log(`[FsTransactionClient] Created with stagingPath=${stagingPath}`);
        }

        async query(command, operation) {
                const normalizedCommand = command.toUpperCase();
                console.log(`[FsTransactionClient] Query command=${normalizedCommand} status=${this.status}`);

                //start transcation
                if (normalizedCommand === "BEGIN") {
                        assert.ok(FsTransactionClient.SUPPORTED_STATUSES.has(this.status), "status is invalid");
                        assert.equal(this.status, "idle");

                        this.stagedOperations = [];
                        this.preparedOperations = [];
                        this.committedOperations = [];
                        this.status = "active";

                        if (this.operationDirectory === undefined) {
                                const absStagingPath = FsOperation.resolvePath(this.stagingPath, "stagingPath");
                                const absOperationDirectory = path.join(absStagingPath, randomUUID());
                                await fs.mkdir(absOperationDirectory, {
                                        recursive: true,
                                });
                                this.operationDirectory = absOperationDirectory;
                        }
                        console.log(`[FsTransactionClient] BEGIN → operationDirectory=${this.operationDirectory}`);
                        return;
                }

                //add a command
                if (normalizedCommand === "QUEUE") {
                        assert.ok(FsTransactionClient.SUPPORTED_STATUSES.has(this.status), "status is invalid");
                        assert.equal(this.status, "active");

                        if (!(operation instanceof FsOperation)) {
                                throw new TypeError("operation must be an FsOperation");
                        }

                        this.stagedOperations.push(operation);
                        console.log(`[FsTransactionClient] QUEUE → queued op=${operation.op}`);
                        return;
                }

                //complete transaction
                if (normalizedCommand === "COMMIT") {
                        assert.ok(FsTransactionClient.SUPPORTED_STATUSES.has(this.status), "status is invalid");
                        assert.equal(this.status, "active");

                        let nextOperation;
                        try {
                                this.status = "preparing";
                                while (this.stagedOperations.length > 0) {
                                        nextOperation = this.stagedOperations.shift();
                                        console.log(`[FsTransactionClient] Preparing queued op=${nextOperation.op}`);
                                        await nextOperation.prepare(this.operationDirectory);
                                        this.preparedOperations.push(nextOperation);
                                }
                                this.status = "prepared";
                        } catch (error) {
                                this.status = "failed_prepare";
                                console.error(`[FsTransactionClient] COMMIT failed:`, error);
                                throw new Error(`Failed to prepare: ${error}`);
                        }

                        try {
                                this.status = "committing";
                                while (this.preparedOperations.length > 0) {
                                        nextOperation = this.preparedOperations.shift();
                                        console.log(`[FsTransactionClient] Executing prepared op=${nextOperation.op}`);
                                        await nextOperation.execute();
                                        this.committedOperations.push(nextOperation);
                                }

                                await fs.rm(this.operationDirectory, {
                                        recursive: true,
                                        force: true,
                                });

                                this.operationDirectory = undefined;
                                this.status = "committed";
                                console.log(`[FsTransactionClient] COMMIT complete`);
                        } catch (error) {
                                this.status = "failed_commit";
                                console.error(`[FsTransactionClient] COMMIT failed:`, error);
                                throw new Error(`Failed to commit: ${error}`);
                        }
                }

                if (normalizedCommand === "ROLLBACK") {
                        console.log(`[FsTransactionClient] ROLLBACK starting`);
                        assert.ok(FsTransactionClient.SUPPORTED_STATUSES.has(this.status), "status is invalid");
                        assert.ok(["active", "preparing", "prepared", "committing", "failed_prepare", "failed_commit", "committed"].includes(this.status));

                        try {
                                let lastOperation;

                                while (this.committedOperations.length > 0) {
                                        lastOperation = this.committedOperations.pop();
                                        await lastOperation.rollback();
                                }

                                while (this.preparedOperations.length > 0) {
                                        lastOperation = this.preparedOperations.pop();
                                        await lastOperation.rollback();
                                }

                                this.status = "rolled_back";
                                console.log(`[FsTransactionClient] ROLLBACK complete`);
                        } catch (error) {
                                this.status = "failed_rollback";
                                console.error(`[FsTransactionClient] ROLLBACK failed:`, error);
                                throw new Error(`Failed to commit: ${error}`);
                        } finally {
                                if (this.operationDirectory) {
                                        await fs.rm(this.operationDirectory, { recursive: true, force: true });
                                        this.operationDirectory = undefined;
                                }
                        }
                }
        }
}

module.exports = { FsOperation, FsTransactionClient };
