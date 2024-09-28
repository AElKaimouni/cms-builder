import { ReactNode } from "react";
import { NavigateFunction, useLocation, useParams, useSearchParams } from "react-router-dom";
import { useConfirmModal } from "../states/modals/Confirm";
import { LayoutAction } from "../states/reducers/layout";
import { LoadingAction } from "../states/reducers/loading";
import { StatusAction } from "../states/reducers/status";
import { UserAction } from "../states/reducers/user";
import { ModelObject } from "./models";
import { SystemStatus } from "./system";
import { User, UserLoginInfo } from "./users";
import { useColorPickerModal } from "../states/modals/ColorPicker";
import { useModelPickerModal } from "../states/modals/ModelPicker";
import { useUploadModal } from "../states/modals/UploadMedia";

export type SideBar = {
    title: string;
    link: string;
    icon: ReactNode;
    blank?: boolean;
}

export type SideBarGroup = {name: string, bars: SideBar[], icon: ReactNode};

export type SideBars = (SideBar | SideBarGroup)[];

export interface MainContextObject {
    user: User | null | undefined;
    status: SystemStatus;
    loading: boolean;
    layout: {
        models: ModelObject[];
        activeBar: string | null;
        sidebars: {
            up: SideBars;
            down: SideBars;
        }
    };
    reducers: {
        user: React.Dispatch<UserAction>;
        status: React.Dispatch<StatusAction>;
        loading: React.Dispatch<LoadingAction>;
        layout: React.Dispatch<LayoutAction>;
    },
    controller: {
        models: {
            getModel: (model: string) => ModelObject;
        },
        router: {
            navigate: (link: string, params?: { [key: string] : string }) => void;
            params: ReturnType<typeof useParams>;
            location: ReturnType<typeof useLocation>;
            searchParams: ReturnType<typeof useSearchParams>[0];
        },
        users: {
            authToken: (token: string) => Promise<boolean>;
            logout: () => void;
            login: (data: UserLoginInfo) => Promise<boolean>;
        },
        loading: {
            start: () => void;
            end: () => void;
            process: (callBack: () => Promise<void>) => void
        },
        status: {
            refetch: () => Promise<void>
        },
        modals: {
            confirm: {
                open: (ReturnType<typeof useConfirmModal>)["open"];
                close: (ReturnType<typeof useConfirmModal>)["close"];
            },
            colorPicker: {
                open: (ReturnType<typeof useColorPickerModal>)["open"];
                close: (ReturnType<typeof useColorPickerModal>)["close"];
            },
            modelPicker: {
                open: (ReturnType<typeof useModelPickerModal>)["open"];
                close: (ReturnType<typeof useModelPickerModal>)["close"];
            },
            uploadMedia: {
                open: (ReturnType<typeof useUploadModal>)["open"];
                close: (ReturnType<typeof useUploadModal>)["close"];
            }
        }
    }
}