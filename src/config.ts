const devMode = (process.env.REACT_APP_MODE || "DEV") === "DEV";

export default {
    SERVER_HOST: devMode ? process.env.REACT_APP_SERVER_HOST : "",
    UI_HOST: devMode ? process.env.REACT_APP_UI_HOST : "",
    USER_TOKEN_KEY: "USER_TOKEN",
    CLOUD_NAME: process.env.REACT_APP_CLOUD_NAME,
    DEV_MODE: devMode
}