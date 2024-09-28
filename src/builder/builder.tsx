import { useEffect } from "react";
import ScreenLoading from "./comps/LoadingScreen";
import Header from "./parts/Header";
import WorkSpace from "./parts/WorkSpace";
import { useBuilderContext } from "./states";

const Builder = () => {
    const context = useBuilderContext();
    const { layout } = context;

    useEffect(() => {
        window.__builder_context = context;
        if(window.__builder_page) window.__builder_page.context = context;
    }, [context]);

    useEffect(() => {
        const message = "Are u sure u wanna close this page, there is unsaved chages ?";
        const handler = (e: BeforeUnloadEvent) => {
            if (window.__builder_context.page.state.canSave) {
                e.preventDefault();
                e.returnValue = message;
                return message;
            }
        }
      
        window.addEventListener("beforeunload", handler);
    
        return () => {
            window.removeEventListener("beforeunload", handler);
        }
    }, []);

    return (
        <>
            <ScreenLoading loading={layout.loading} />
            <Header />
            <WorkSpace />
        </>
    )
}

export default Builder;