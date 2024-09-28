import React from "react";
import Builder from "./builder";
import { BuilderContext } from "./types";

export default Builder;
export { useBuilderContext } from "./states";
export * from "./Fields";

declare global {
    interface Window {
        __builder_context: BuilderContext;
    }
}