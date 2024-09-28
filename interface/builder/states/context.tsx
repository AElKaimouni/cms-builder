import React, { CSSProperties } from "react";
import { BuilderComps, WC } from "../types";

interface BuilderContextObject {
    info: any;
    theme: any;
    comps: BuilderComps;
    elements: BuilderComps;
    dev: boolean;
    c: (...context: any[]) => any;
    style: (props: any, style?: CSSProperties) => any;
    model?: any;
    device: string;
    media: {
        gte: (device: string) => boolean;
        lte: (device: string) => boolean;
    }
}

const BuilderContext = React.createContext<BuilderContextObject>({} as any);
export const useBuilderContext = () => {
    return React.useContext(BuilderContext)
}

export default BuilderContext;