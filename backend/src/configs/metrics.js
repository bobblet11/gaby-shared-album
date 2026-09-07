// metrics.js
const StatsD = require("node-statsd");
const config = require("./config");

// Connect to your local StatsD daemon (default port 8125)
// send directly to a graphite server
const statsd = new StatsD({
        host: config.metrics.host,
        port: config.metrics.port,
        protocol: 'udp'
});


module.exports = statsd;
