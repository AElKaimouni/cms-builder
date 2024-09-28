import axios, { AxiosError } from "axios";
import config from "../config";

const uiAPI = axios.create({
    baseURL: config.env.UI_HOST + "/api/",
})


export default uiAPI;