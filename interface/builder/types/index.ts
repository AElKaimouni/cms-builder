export * from "./Wapi";
export * from "./Models";
export * from "./Fields";
export * from "./Comps";
export * from "./Page";
export * from "./Context";


export type WC<Type> = [Type, Object, string];
export type WCD<Type, Comp> = [Type, Object, string, Comp];
export type WCList<Type> = [Type[], Object, string];
