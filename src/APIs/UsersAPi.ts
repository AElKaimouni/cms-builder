import { AxiosError } from "axios";
import config from "../config";
import { User, UserCreateInput, UserDeleteInput, UserFindInput, UserLoginInfo, UserRegisterInfo, UserTableInput, UserUpdateInput } from "../types/users";
import CmsAPi from "./CmsApi"

export default {
    authToken: async (token: string) => {
        try {
            const res = await CmsAPi.get("/user/auth/" + token);
    
            window.localStorage.setItem(config.USER_TOKEN_KEY, token as string);
    
            return res.data as User;
        } catch(error) {
            if(error instanceof AxiosError) {
                if(error.response && error.response.status === 400) return null;
                else throw error;
            } else throw error;
        }
    },
    registerUser: async (registerInfo: UserRegisterInfo) : Promise<{ status: boolean, error?: { field: string, error: string }, token?: string }> => {
        try {
            const res = await CmsAPi.post("/user/register", registerInfo);
    
            return { status: true, token: res.data.token };
        } catch(error) {
            if(error instanceof AxiosError) {
                if(error.response && error.response.status === 400) return {
                    status: false,
                    error: error.response.data
                }; else return { status: false };
            } else throw error;
        }
    },
    loginUser : async (loginInfo: UserLoginInfo) : Promise<{ token, user } | null > => {
        try {
            const res = await CmsAPi.post("/user/login", loginInfo);
    
            window.localStorage.setItem(config.USER_TOKEN_KEY, res.data.token as string);
            
            return { user: res.data.user as User, token: res.data.token as string };
        } catch (error) {
            if(error instanceof AxiosError) {
                if(error.response && error.response.status === 400) return null;
                else if(error.response && error.response.status === 403) return null;
                else throw error;
            } else throw error;
        }
    },
    updateUser: async (info: UserUpdateInput) => {
        try {
            await CmsAPi.post("/user/update", info);
        } catch(error) { throw error }
    },
    deleteUsers: async (users: UserDeleteInput["users"]) => {
        try {
            const res = await CmsAPi.post("/user/delete", { users });

            return res.data as number;
        } catch(error) { throw error }
    },
    table: async (info: UserTableInput) => {
        try {
            const res = await CmsAPi.post("/user/table", info);

            return res.data as { count: number, users: User[] };
        } catch(error) { throw error }
    },
    createUser: async (info: UserCreateInput) => {
        try {
            const res = await CmsAPi.post("/user/create", info);

            return res.data as User;
        } catch(error) { throw error }
    },
    getUser: async (info: UserFindInput) => {
        try {
            const res = await CmsAPi.post("/user", info);

            return res.data as User;
        } catch(error) { throw error }
    }
}