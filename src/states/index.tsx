import React, { useEffect } from "react";
import { CmsAPi, ModelAPi, UsersAPi } from "../APIs";
import { MainContextObject, ModelObject } from "../types";
import { getUserToken, parseStatus, setupSideBars, setUserToken } from "../utils";
import { LoadingActions, loadingReducer } from "./reducers/loading";
import { StatusActions, statusReducer } from "./reducers/status";
import { UserActions, userReducer } from "./reducers/user";
import { createSearchParams, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { RawSystemStatus, SystemStatus } from "../types/system";
import { LayoutActions, layoutReducer } from "./reducers/layout";
import ConfirmModal, { useConfirmModal } from "./modals/Confirm";
import ColorPickerModal, { useColorPickerModal } from "./modals/ColorPicker";
import config from "../config";
import ModelPickerModal, { useModelPickerModal } from "./modals/ModelPicker";
import UploadMediaModal, { useUploadModal } from "./modals/UploadMedia";

const MainContext = React.createContext<MainContextObject>({ } as any);

export const MainContextProvider = ({ children }) => {
    // use 3rd party hooks
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();
    const searchParams = useSearchParams()[0];

    // attach reducers
    const [user, setUser] = React.useReducer(userReducer, undefined);
    const [status, setStatus] = React.useReducer(statusReducer, {} as any);
    const [loading, setLoading] = React.useReducer(loadingReducer, true);
    const [layout, setLayout] = React.useReducer(layoutReducer, {
        models: [],
        activeBar: location.pathname,
        sidebars: {
            up: [],
            down: []
        }
    });

    // attach modals controllers
    const confirmModalController = useConfirmModal();
    const colorPickerModalController = useColorPickerModal();
    const modelPickderModalController = useModelPickerModal();
    const uploadMediaModalController = useUploadModal();

    // attach controllers
    const routerController : MainContextObject["controller"]["router"] = {
        params, location, searchParams,
        navigate : (url: string, params?: { [key: string]: string }) => navigate({
            pathname: url,
            search: params ? `?${createSearchParams(params)}` : searchParams.toString()
        })
    };
    const userController : MainContextObject["controller"]["users"] = {
        authToken: async (token: string) => {
            const user = await UsersAPi.authToken(token);
            setUser({ type: UserActions.SET, user })

            return Boolean(user);
        },
        logout: () => {
            window.localStorage.removeItem(config.USER_TOKEN_KEY);
            setUser({ type: UserActions.SET, user: null });
        },
        login: async (userInfo) => {
            const res = await UsersAPi.loginUser(userInfo);

            if(res) {
                setUserToken(res.token);
                setUser({ type: UserActions.SET, user: res.user });
            }

            return Boolean(user);
        }
    };
    const loadingController : MainContextObject["controller"]["loading"] = {
        start: () => setLoading({ type: LoadingActions.SET, loading: true }),
        end: () => setLoading({ type: LoadingActions.SET, loading: false }),
        process: async callBack => {
            loadingController.start();
            await callBack();
            loadingController.end();
        }
    };
    const statesController : MainContextObject["controller"]["status"] = {
        refetch: async () => {
            const res = await CmsAPi.get("/config/status");

            setStatus({ type: StatusActions.SET, status: res.data });

            return;
        }
    };
    const modalsController : MainContextObject["controller"]["modals"] = {
        confirm: {
            close: confirmModalController.close,
            open: confirmModalController.open
        },
        colorPicker: {
            close: colorPickerModalController.close,
            open: colorPickerModalController.open
        },
        modelPicker: {
            close: modelPickderModalController.close,
            open: modelPickderModalController.open
        },
        uploadMedia: {
            close: uploadMediaModalController.close,
            open: uploadMediaModalController.open
        }
    }
    const modelsController : MainContextObject["controller"]["models"] = {
        getModel: (model: string) => {
            switch(model) {
                case "media": return {
                    name: "media",
                    props: {}
                } as ModelObject;
            }
            const res = layout.models.find(m => m.name === model);

            if(!res) throw new Error(`Model: ${model} is not exist.`);

            return res;
        } 
    }

    // attach relations
    useEffect(() => {
        setLayout({ type: LayoutActions.SET_ACTIVE_BAR, bar: location.pathname });
    }, [location]);
    useEffect(() => {
        if(user) setupSideBars(user).then(bars => {
            setLayout({ type: LayoutActions.SET_SIDE_BARS, ...bars})
        })
    }, [user]);

    // load data
    useEffect(() => {
        const token = getUserToken();

        CmsAPi.get("/config/status").then(res => {
            const status = parseStatus(res.data as RawSystemStatus);

            setStatus({ type: StatusActions.SET, status });

            if(token) UsersAPi.authToken(token).then(user => {
                const status = res.data as SystemStatus;
    
                setUser({ type: UserActions.SET, user });

                if(!user && !status?.firstUser) {
                    routerController.navigate("/login");
                } else if(status.firstUser) {
                    routerController.navigate("/start");
                } 

                setLoading({ type: LoadingActions.SET, loading: false });
            }); else {
                setUser({ type: UserActions.SET, user: null });
                setLoading({ type: LoadingActions.SET, loading: false });
    
                if(!status.firstUser) routerController.navigate("/login");
                else routerController.navigate("/start");
            };
        });
    }, []);

    useEffect(() => {
        if(user) ModelAPi.fetchModels().then(models => {
            setLayout({ type: LayoutActions.SET_MODELS, models });
        })
    }, [user])

    return (
        <MainContext.Provider value={{
            user,
            status,
            loading,
            layout,
            reducers: {
                user: setUser,
                status: setStatus,
                loading: setLoading,
                layout: setLayout
            },
            controller: {
                models: modelsController,
                router: routerController,
                users: userController,
                loading: loadingController,
                status: statesController,
                modals: modalsController
            }
        }}>
            {children}
            <ConfirmModal controller={confirmModalController} />
            <ColorPickerModal controller={colorPickerModalController} />
            <ModelPickerModal controller={modelPickderModalController} />
            <UploadMediaModal controller={uploadMediaModalController} />
        </MainContext.Provider>
    )
};

export const useMainContext = () => React.useContext(MainContext);