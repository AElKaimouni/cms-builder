import { ReactNode } from "react";
import Header from "./Header";
import SideBar from "./SideBar";

interface Props {
    children: ReactNode;
    type?: "form" | "error" | "default";
}

export default ({ children, type } : Props) => {
    const layoutType = type || "default";

    return (
        <div id="app-layout" className={layoutType}>
            {layoutType === "default" && <>
                <Header />
                <div id="app-down">
                    <SideBar />
                    <div id="app-container">
                        {children}
                    </div>
                </div>
            </>}
            {layoutType === "form" && <>
                <div id="app-from-container">
                    {children}
                </div>
            </>}
            {layoutType === "error" && <>
                {children}
            </>}
        </div>
    )
}