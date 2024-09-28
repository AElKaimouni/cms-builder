export interface BuilderContext {
    hcomp: HTMLElement | null;
    scomp: HTMLElement | null;
    ssection: HTMLElement | null;
    focus: "sections" | "comps" | "both";
    mx: number;
    my: number;
    browseMode: boolean;
    childsOfContext?: string;
}