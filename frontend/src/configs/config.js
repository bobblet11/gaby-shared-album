export const config = {
        api: {
                domain: process.env.REACT_APP_API_URL || "http://localhost:8080",
                use_api: process.env.REACT_APP_FEATURE_FLAG === "true" || false,
                max_files_per_upload: parseInt(process.env.process.env.REACT_APP_MAX_FILE_UPLOAD , 10)|| 15,
        },
};

// Hard‑coded list of keys to hide when printing
const hiddenKeys = [
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
console.log("=== Application Configuration ===");
console.log(JSON.stringify(maskConfig(config, hiddenKeys), null, 2));
console.log("=================================");
