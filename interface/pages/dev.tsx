import { useEffect, useMemo, useState } from "react";
import Builder, { useBuilderContext } from "../builder";
import config from "../builder.config";
import { useLoader } from "../utils";
import { PageLoader } from "../comps";
 
const builder = new Builder(config as any);

const DevPage = () => {

    return (
        <>
            {builder.DevRoot((info, theme) => {
                if(theme.primary) document.body.style.setProperty("--primary-color", theme.primary);
                if(theme.secondary) document.body.style.setProperty("--secondary-color", theme.secondary);
            })}
        </>
        
    )
}

export default DevPage;