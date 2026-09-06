const path = require("path");
require("dotenv").config();
const logger = require("./logger")

const config = {
        db: {
                user: process.env.DB_USER || "user",
                password: process.env.DB_PASS || "pass",
                host: process.env.DB_HOST || "db",
                port: parseInt(process.env.DB_PORT, 10) || 5432,
                name: process.env.DB_NAME || "db_name",
        },

        api: {
                domain: process.env.PUBLIC_API_DOMAIN || "public_domain",
                host: process.env.API_HOST || "backend",
                port: parseInt(process.env.API_PORT, 10) || 3000,
        },

        media: {
                basePath: process.env.BASE_MEDIA_PATH || path.resolve(__dirname, "../media"),
                tempScaleFolder: process.env.TEMP_SCALE_IMAGE_FOLDER_NAME || "tmp",
                originalScaleFolder: process.env.ORIGINAL_SCALE_IMAGE_FOLDER_NAME || "orig",
                fullScaleFolder: process.env.FULL_SCALE_IMAGE_FOLDER_NAME || "full",
                downScaleFolder: process.env.DOWN_SCALE_IMAGE_FOLDER_NAME || "down",
        },

        metrics: {
                host: process.env.GRAPHITE_HOST || "graphite",
                port: parseInt(process.env.GRAPHITE_PORT_INGEST, 10) || 8126,
        },

        logs: {
                logFilePath: process.env.LOGS_FILE_PATH || "/var/log/app.log",
        },
};

// Hard‑coded list of keys to hide when printing
const hiddenKeys = [
        "db.password", // hide DB password
        // add more like "api.secretKey", "media.basePath" if needed
];

// Utility: remove hidden keys from a deep object
function maskConfig(obj, hidden) {
        const clone = JSON.parse(JSON.stringify(obj));
        hidden.forEach((keyPath) => {
                const parts = keyPath.split(".");
                let target = clone;
                for (let i = 0; i < parts.length - 1; i++) {
                        if (target[parts[i]]) {
                                target = target[parts[i]];
                        } else {
                                return; // path not found
                        }
                }
                const lastKey = parts[parts.length - 1];
                if (target[lastKey] !== undefined) {
                        target[lastKey] = "***HIDDEN***";
                }
        });
        return clone;
}

// Pretty‑print config when app runs
if (process.env.NODE_ENV !== "test") {
        logger.info("=== Application Configuration ===");
        logger.info(JSON.stringify(maskConfig(config, hiddenKeys), null, 2));
        logger.info("=================================");
}

module.exports = config;
