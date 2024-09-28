import axios, { AxiosError } from "axios";
import config from "../config";
import toastr from "toastr";

const uiAPI = axios.create({
    baseURL: config.SERVER_HOST + "/api/",
})


export default uiAPI;