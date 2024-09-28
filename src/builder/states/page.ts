import { useEffect, useReducer } from "react";
import { Page, } from "../classes";
import { BuilderSymbol, ContextObject } from "../types";

export enum PageActions {
    ChangeLink,
    ChangeHost,
    ChangeTitle,
    ChangeLocale,
    ChangeVersion,
    ToggleSave,
    TogglePublish,
    SetAvaibleTargets,
    AddAvaibleTarget,
    RemoveAvaibleTarget,
    Setlayers,
    AddSymbol,
    DeleteSymbol,
    SetSymbols
};

export type PageAction =
    { type: PageActions.ChangeLink, link: string } |
    { type: PageActions.ChangeHost, host: string } |
    { type: PageActions.ChangeTitle, title: string } |
    { type: PageActions.ChangeLocale, locale: string } |
    { type: PageActions.ChangeVersion, version: string } |
    { type: PageActions.TogglePublish, val?: boolean } |
    { type: PageActions.ToggleSave, val?: boolean } |
    { type: PageActions.SetAvaibleTargets, targets: string[] } |
    { type: PageActions.AddAvaibleTarget, target: string } |
    { type: PageActions.RemoveAvaibleTarget, target: string } |
    { type: PageActions.Setlayers, layers: ContextObject["page"]["state"]["layers"] } |
    { type: PageActions.SetSymbols, symbols: BuilderSymbol[] } |
    { type: PageActions.AddSymbol, symbol: BuilderSymbol } |
    { type: PageActions.DeleteSymbol, symbol: BuilderSymbol }
;

const page = new Page();

const pageReducer = (state: ContextObject["page"]["state"], action: PageAction) : ContextObject["page"]["state"] => {
    switch(action.type) {
        case PageActions.ChangeLink : return {
            ...state,
            link: action.link   ,
            url: state.host + "/" + state.locale + action.link 
        };
        case PageActions.ChangeHost : return {
            ...state,
            host: action.host,
            url: action.host + "/" + state.locale + state.link 
        };
        case PageActions.ChangeTitle : return {
            ...state,
            title: action.title
        }
        case PageActions.ChangeLocale : return {
            ...state,
            locale: action.locale,
            url: state.host  + "/"+ action.locale + state.link 
        };
        case PageActions.ChangeVersion : return {
            ...state,
            version: action.version    
        };
        case PageActions.Setlayers : return {
            ...state,
            layers: action.layers    
        };
        case PageActions.ToggleSave : return {
            ...state,
            canSave: action.val !== undefined ? action.val : !state.canSave
        };
        case PageActions.TogglePublish : return {
            ...state,
            canPublish: action.val !== undefined ? action.val : !state.canPublish
        };
        case PageActions.SetAvaibleTargets: return {
            ...state,
            avaibleTargets: action.targets
        };
        case PageActions.AddAvaibleTarget: return {
            ...state,
            avaibleTargets: state.avaibleTargets.concat([action.target])
        };
        case PageActions.RemoveAvaibleTarget: return {
            ...state,
            avaibleTargets: state.avaibleTargets.filter(target => target !== action.target)
        };
        case PageActions.SetSymbols: return {
            ...state,
            symbols: action.symbols
        };
        case PageActions.AddSymbol: return {
            ...state,
            symbols: state.symbols.concat([action.symbol])
        };
        case PageActions.DeleteSymbol: return {
            ...state,
            symbols: state.symbols.filter(symbol => symbol._id !== action.symbol._id)
        }
        default : return state;
    }
}

const defaultPageState : ContextObject["page"]["state"] = {
    avaibleTargets: [],
    canPublish: false,
    canSave: false,
    host: "",
    layers: { fixed: [], indexed: [] },
    link: "",
    locale: "",
    url: "",
    version: "",
    title: "",
    symbols: []
}

export const usePage = (context?: ContextObject) : ContextObject["page"] => {
    const [state, set] = useReducer(pageReducer, context?.page.state || defaultPageState);

    useEffect(() => {
        if(!context) {
            const params = (new URL(window.location.href));
            const slug = params.searchParams.get("page");
            const locale = params.searchParams.get("locale");

            window.__builder_page = page;
            page.load({ slug: slug || "home-page" }, locale || undefined).then(() => console.log("Page Loaded"));
        }
    }, []);

    return {
        state, set,
        module: context?.page.module || page
    };
};