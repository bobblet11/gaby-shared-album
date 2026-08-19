const express = require("express");

const bodyParser = require("body-parser");
const logToWinston = require("./middlewares/logToWinston");
const logger = require("./configs/winston")
const errorHandler = require("./middlewares/errorHandler");
const config  = require("./configs/config");
const photoService = require("./services/photoService");
const photoRoutes = require("./routes/photoRoutes");
const countRequest = require("./middlewares/countRequest");

photoService.statusCheck();

const app = express();
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use(logToWinston);
app.use(countRequest)

logger.info("Mounting /test");
app.get("/api/test", (req, res) => res.send("OK"));

logger.info("Mounting /api/photos");
app.use("/api/photos", photoRoutes);

app.use(errorHandler);

const server = app.listen(config.api.port, (error) => {
        if (!error) {
                logger.info("Server is Successfully Running, and App is listening on port " + config.api.port);
        } else {
                logger.error("Error occurred, server can't start", error);
        }
});



server.setTimeout(10 * 60 * 1000);
