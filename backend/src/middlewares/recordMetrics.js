const statsd = require("../configs/metrics");

// Base metric namespaces
const METRICS = {
        requests: "http.requests",
        requestSize: "http.requests.size",
        uploadedFiles: "http.requests.uploaded_files",
        responseTime: "http.requests.response_time",
        status: "http.status",
        timeout: "http.timeout",
};

// Helper to build keys consistently
function key(base, ...parts) {
        return [base, ...parts].filter(Boolean).join(".");
}

function recordMetrics(routeName) {
        return (req, res, next) => {
                // Requests
                statsd.increment(key(METRICS.requests, "total"));
                statsd.increment(key(METRICS.requests, routeName));

                // Request size
                const bodySize = Buffer.byteLength(JSON.stringify(req.body || {}));
                statsd.histogram(key(METRICS.requestSize, "total"), bodySize);
                statsd.histogram(key(METRICS.requestSize, routeName), bodySize);

                // Uploaded files
                const fileCount = Array.isArray(req.files) ? req.files.length : 0;
                statsd.increment(key(METRICS.uploadedFiles, "total"), fileCount);
                statsd.increment(key(METRICS.uploadedFiles, routeName), fileCount);

                const start = Date.now();
                res.on("finish", () => {
                        const status = String(res.statusCode);
                        const duration = Date.now() - start;

                        // Response time
                        statsd.timing(key(METRICS.responseTime, "total"), duration);
                        statsd.timing(key(METRICS.responseTime, routeName), duration);

                        // Status codes
                        statsd.increment(key(METRICS.status, "total", status));
                        statsd.increment(key(METRICS.status, routeName, status));
                });

                res.on("timeout", () => {
                        statsd.increment(key(METRICS.timeout, "total"));
                        statsd.increment(key(METRICS.timeout, routeName));
                });

                next();
        };
}

module.exports = recordMetrics;
