const statsd = require("../configs/metrics");

// Base metric namespaces
const METRICS = {
        //increments
        requestsCount: "api.requests",
        statusCount: "api.status",
        timeoutCount: "api.timeout",

        //value records
        bodySize: "api.body_size",
        numUploadedFiles: "api.num_uploaded_files",
        
        //timing
        latencyTiming: "api.latency",
};

// Helper to build keys consistently
function key(base, ...parts) {
        return [base, ...parts].filter(Boolean).join(".");
}

function recordMetrics(routeName) {
        return (req, res, next) => {
                // Requests
                statsd.increment(key(METRICS.requestsCount, "total"));
                statsd.increment(key(METRICS.requestsCount, routeName));

                // Request size
                const bodySize = Buffer.byteLength(JSON.stringify(req.body || {}));
                statsd.histogram(key(METRICS.bodySize, "total"), bodySize);
                statsd.histogram(key(METRICS.bodySize, routeName), bodySize);

                // Uploaded files
                const fileCount = Array.isArray(req.files) ? req.files.length : 0;
                statsd.histogram(key(METRICS.numUploadedFiles, "total"), fileCount);
                statsd.histogram(key(METRICS.numUploadedFiles, routeName), fileCount);

                const start = Date.now();
                res.on("finish", () => {
                        const status = String(res.statusCode);
                        const duration = Date.now() - start;

                        // Status codes
                        statsd.increment(key(METRICS.statusCount, "total", status));
                        statsd.increment(key(METRICS.statusCount, routeName, status));

                        // Response time
                        statsd.timing(key(METRICS.latencyTiming, "total"), duration);
                        statsd.timing(key(METRICS.latencyTiming, routeName), duration);
                });

                res.on("timeout", () => {
                        statsd.increment(key(METRICS.timeoutCount, "total"));
                        statsd.increment(key(METRICS.timeoutCount, routeName));
                });

                next();
        };
}

module.exports = recordMetrics;
