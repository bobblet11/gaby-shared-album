
const config = require("./config")
const logger = require("./logger");

// Hard‑coded list of keys to hide when printing
const hiddenKeys = [
        "db.password", // hide DB password
        // add more like "api.secretKey", "media.basePath" if needed
];

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


const printConfig = () => {
        // Pretty‑print config when app runs
        if (process.env.NODE_ENV !== "test") {
                logger.info("=== Application Configuration ===");
                logger.info(JSON.stringify(maskConfig(config, hiddenKeys), null, 2));
                logger.info("=================================");
        }
};

module.exports = printConfig;
