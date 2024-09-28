import { useEffect } from "react";
import { useMainContext } from "../states";
import Logo from "./Logo"
import MediaComp from "./Media";
import { defaultProfileAvatar, getUserRole } from "../utils";
import { UserRole } from "../types";
import { Media } from "../types/media";
import Dropmenu from "./Dropmenu";
import { ChevDownIcon } from "../builder/icons";

export default () => {
    const { controller, user } = useMainContext();

    return  (
        <div id="app-header">
            <div id="header-logo">
                <Logo />
            </div>
            <div id="header-left">
                
            </div>
            <div id="header-right">
                <Dropmenu className="profile-button" actions={[
                    {
                        name: "Profile",
                        callBack: () => controller.router.navigate("/profile")
                    },
                    {
                        name: "Settings",
                        callBack: () => controller.router.navigate("/profile")
                    },
                    "line",
                    {
                        name: "Logout",
                        callBack: () => controller.users.logout()
                    }
                ]} >
                    <ChevDownIcon />
                    <div className="profile-info">
                        <p className="user-name">
                            {user?.name}
                        </p>
                        <p className="user-role">
                            {getUserRole(user?.role as UserRole)}
                        </p>
                    </div>
                    <div className="profile-avatar">
                        <MediaComp className="avatar-img" media={user?.avatar || defaultProfileAvatar} />
                    </div> 
                </Dropmenu>

            </div>
        </div>
    )
}