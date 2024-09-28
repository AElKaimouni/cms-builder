import nextConfig from "../interface/next.config.js";

const devMode = process.argv[2] === "dev";
const port = process.env.PORT || 2002;

export default {
    host: process.env.SERVER_HOST || `http://localhost:${port}`,
    dev: devMode,
    nextDev: process.argv[3] !== "server-only",
    action: process.argv[2],
    args:  process.argv.slice(4),
    build: process.argv[2] === "build",
    end: process.argv[2] === "end",
    database: {
        name: process.env.DB_NAME,
        host: process.env.DB_HOST
    },
    cloudinary: {
        cloudname: process.env.CLOUD_NAME,
        cloudkey: process.env.CLOUD_API_KEY,
        cloudsecret: process.env.CLOUD_API_SECRET
    },
    smtp: {
        login: process.env.SMTP_LOGIN,
        pass: process.env.SMTP_PASSWORD,
        host: process.env.SMTP_HOST,
        recivier: process.env.MAIL_RECIVIER,
    },
    env: {
        PORT: port,
        AUTH_SECERT: process.env.AUTH_SECRET,
        SERVER_SECRET: process.env.SECRET_KEY,
        SERVER_HOST: process.env.SERVER_HOST || `http://localhost:${port}`,
        UI_HOST: process.env.UI_HOST || `http://localhost:${port}`,
        DEV_MODE: (process.env.MODE || "DEV") === "DEV",
        NEXT_DOMAIN_ID: process.env.NEXT_DOMAIN_ID
    },
    next: nextConfig
}