// run: node scripts/test-db.js
const path = require("path");
const db = require(path.resolve(__dirname, "../backend/db"));

(async () => {
        try {
                const res = await db.query("SELECT NOW()");
                console.log("Postgres connected:", res.rows[0]);
                process.exit(0);
        } catch (err) {
                console.error("DB connection failed", err);
                process.exit(1);
        }
})();
