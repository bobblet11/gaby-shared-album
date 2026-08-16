const express = require("express");

const bodyParser = require("body-parser");
const photoService = require("../src/services/photoService");

photoService.statusCheck();

// import your router, logger, and errorHandler
const photoRouter = require("../src/routes/photoRoutes");
const logger = require("../src/middlewares/logger");
const errorHandler = require("../src/middlewares/errorHandler");

const defaultAppConfig = {
        useLogger: true,
        useErrorHandler: true,
        routes: {
                "/api/photos": photoRouter,
        },
};

function createTestApp(config = defaultAppConfig) {
        photoService.statusCheck();

        const app = express();
        app.use(bodyParser.json({ limit: "50mb" }));
        app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

        if (config.useLogger) {
                app.use(logger);
        }

        for (const [routeName, router] of Object.entries(config.routes)) {
                app.use(routeName, router);
        }

        if (config.useErrorHandler) {
                app.use(errorHandler);
        }

        return app;
}

module.exports = { createTestApp };
