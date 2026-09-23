const path = require("path");
require("dotenv").config();

const config = {
        db: {
                user: process.env.DB_USER || "user",
                password: process.env.DB_PASS || "pass",
                host: process.env.DB_HOST || "db",
                port: parseInt(process.env.DB_PORT, 10) || 5432,
                name: process.env.DB_NAME || "db_name",
        },

        api: {
                domain: process.env.PUBLIC_API_DOMAIN || "public_domain",
                host: process.env.API_HOST || "backend",
                port: parseInt(process.env.API_PORT, 10) || 3000,
        },

        media: {
                basePath: process.env.BASE_MEDIA_PATH || path.resolve(__dirname, "../media"),
                tempScaleFolder: process.env.TEMP_SCALE_IMAGE_FOLDER_NAME || "tmp",
                originalScaleFolder: process.env.ORIGINAL_SCALE_IMAGE_FOLDER_NAME || "orig",
                fullScaleFolder: process.env.FULL_SCALE_IMAGE_FOLDER_NAME || "full",
                downScaleFolder: process.env.DOWN_SCALE_IMAGE_FOLDER_NAME || "down",
        },

        metrics: {
                host: process.env.GRAPHITE_HOST || "graphite",
                port: parseInt(process.env.GRAPHITE_PORT_INGEST, 10) || 8126,
        },

        logs: {
                logFilePath: process.env.LOGS_FILE_PATH || "/logs/app.log",
        },
};

module.exports = config;
