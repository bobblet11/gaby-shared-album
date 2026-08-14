const express = require("express");

const bodyParser = require("body-parser");
const logger = require("./middlewares/logger");
const errorHandler = require("./middlewares/errorHandler");
const config  = require("./configs/config");
const photoService = require("./services/photoService");
const photoRoutes = require("./routes/photoRoutes");

photoService.statusCheck();

const app = express();
app.use(logger);
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use("/api/photos", photoRoutes);

app.use(errorHandler);

const server = app.listen(config.api.port, (error) => {
        if (!error) {
                console.log("Server is Successfully Running, and App is listening on port " + config.api.port);
        } else {
                console.log("Error occurred, server can't start", error);
        }
});

server.setTimeout(10 * 60 * 1000);
