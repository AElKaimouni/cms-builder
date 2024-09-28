import React from "react";
import { MainContextObject } from "../../types";

export enum LoadingActions {
    SET
};

export type LoadingAction = { type: LoadingActions.SET, loading };

export const loadingReducer = (state: MainContextObject["loading"], action: LoadingAction) => {
    switch(action.type) {
        case LoadingActions.SET: return action.loading;
        default: return state;
    }
}