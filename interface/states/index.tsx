import { Router } from "next/router";
import React, { useState } from "react";

interface ContextObject {
    pageLoading: boolean;
    ww: number;
}

const context = React.createContext<ContextObject>({} as any);

export const useMainContext = () => {
    return React.useContext(context);
}

export const ContextProvider = ({ children }) => {
    const [pageLoading, setPageLoading] = useState(true);
    const [ww, setWW] = useState<number>();

    React.useEffect(() => {
        const start = () => {
            setPageLoading(true);
        };
        const end = () => {
            setPageLoading(false);
        };
        const resizeHandler = () => {
            setWW(window.innerWidth);
        }

        window.setTimeout(() => setPageLoading(false), 0);

        Router.events.on("routeChangeStart", start);
        Router.events.on("routeChangeComplete", end);
        Router.events.on("routeChangeError", end);

        resizeHandler();
        window.addEventListener("reset", resizeHandler);

        return () => {
            Router.events.off("routeChangeStart", start);
            Router.events.off("routeChangeComplete", end);
            Router.events.off("routeChangeError", end);
            window.removeEventListener("reset", resizeHandler);
        };
    }, []);


    return (
        <context.Provider value={{ pageLoading, ww }}>
            {children}
        </context.Provider>
    );
};