import { MainContextObject, SideBars } from "../../types";
import { ModelObject } from "../../types/models";

export enum LayoutActions {
    SET_SIDE_BARS,
    SET_ACTIVE_BAR,
    SET_MODELS
}

export type LayoutAction =
    { type: LayoutActions.SET_SIDE_BARS, up?: SideBars, down?: SideBars } |
    { type: LayoutActions.SET_ACTIVE_BAR, bar: string } |
    { type: LayoutActions.SET_MODELS, models: ModelObject[] }

export const layoutReducer = (state: MainContextObject["layout"], action: LayoutAction) : MainContextObject["layout"] => {
    switch(action.type) {
        case LayoutActions.SET_SIDE_BARS: return {
            ...state,
            sidebars: {
                up: action.up || state.sidebars.up,
                down: action.down || state.sidebars.down
            }
        };
        case LayoutActions.SET_ACTIVE_BAR: return {
            ...state,
            activeBar: action.bar
        };
        case LayoutActions.SET_MODELS: return {
            ...state,
            models: action.models
        }
        default: return state;
    }
}