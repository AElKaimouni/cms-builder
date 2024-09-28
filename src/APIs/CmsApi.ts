import axios, { AxiosError } from "axios";
import { toast } from 'react-toastify';
import config from "../config";

const CmsAPi = axios.create({
    baseURL: `${config.SERVER_HOST}/cms`
});

CmsAPi.interceptors.response.use(undefined, (error) => {
    if(error instanceof AxiosError && error.response) {
        if(error.response.status === 403) {
            toast("You do not have access.");
        } else if (error.response.status === 500) {
            toast("Internal server error.");
        } else if (error.response.status === 401) {
            window.location.href = "/admin/login";
        } else if (error.response.status === 0) {
            toast("Connection Error.");
        }

    } throw error;
});

CmsAPi.interceptors.request.use(req => {
    const token = window.localStorage.getItem(config.USER_TOKEN_KEY);
    if(req.headers) req.headers.Authorization =  token || undefined;

    return req;
})

export default CmsAPi;