// metrics.js
const StatsD = require("node-statsd");
const config = require("./config");

// Connect to your local StatsD daemon (default port 8125)
const statsd = new StatsD({
        host: config.metrics.host,
        port: config.metrics.port,
});

// Example metrics
const recordRequest = async (req, res) => {
        statsd.increment("http.requests"); // counter
        const start = Date.now();
        res.on("finish", () => {
                const duration = Date.now() - start;
                statsd.timing("http.response_time", duration); // timer
                statsd.increment(`http.status.${res.statusCode}`); // per-status counter
        });
};

module.exports = {
        recordRequest,
};
