const { Pool } = require("pg");
const config = require("./config");
const pool = new Pool({
        user: config.db.user,
        password: config.db.password,
        host: config.db.host,
        port: config.db.port,
        database: config.db.name,
});

const databaseUrl = `postgresql://${config.db.user}:${config.db.password}@${config.db.host}:${config.db.port}/${config.db.name}`;
const encodedPassword = encodeURIComponent(config.db.password);
const encodedDatabaseUrl = `postgresql://${config.db.user}:${encodedPassword}@${config.db.host}:${config.db.port}/${config.db.name}`;

module.exports = {
        databaseUrl,
        encodedDatabaseUrl,
        query: (text, params) => pool.query(text, params),
        connect: () => pool.connect(),
};
