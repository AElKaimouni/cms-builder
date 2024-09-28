import axios, { AxiosError } from "axios";
import config from "../config";

const CMSAPi = axios.create({
    baseURL: config.env.SERVER_HOST + "/cms/",
    headers: {
        Authorization: config.env.SERVER_SECRET
    }
})

export default CMSAPi;