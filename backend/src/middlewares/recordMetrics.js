const statsd = require("../configs/metrics");

// returns a function that injects routeName into its definition. req and res will be filled in via arguments
function recordMetrics(routeName) {
        return (req, res, next) => {
                statsd.increment("http.request"); // counter
                statsd.increment(`http.request.${routeName}`);

                const bodySize = Buffer.byteLength(JSON.stringify(req.body || {}));
                statsd.histogram("http.request_size", bodySize);
                statsd.histogram(`http.request_size.${routeName}`, bodySize);

                const fileCount = Array.isArray(req.files) ? req.files.length : 0;
                statsd.increment("http.request.uploaded_files", fileCount);
                statsd.increment(`http.request.uploaded_files.${routeName}`, fileCount);

                const start = Date.now();
                res.on("finish", () => {
                        const status = String(res.statusCode);
                        const duration = Date.now() - start;

                        statsd.timing("http.response_time", duration);
                        statsd.timing(`http.response_time.${routeName}`, duration);

                        statsd.increment(`http.status.${status}`);
                        statsd.increment(`http.status.${routeName}.${status}`);
                });

                res.on("timeout", () => statsd.increment("http.timeout"));
                res.on("timeout", () => statsd.increment(`http.timeout.${routeName}`));

                next();
        };
}

module.exports = recordMetrics;
