import React from "react";
import { MainContextObject } from "../../types";
import { SystemStatus } from "../../types/system";

export enum StatusActions {
    SET
};

export type StatusAction = { type: StatusActions.SET, status: SystemStatus };

export const statusReducer = (state: MainContextObject["status"], action: StatusAction) => {
    switch(action.type) {
        case StatusActions.SET: return action.status;
        default: return state;
    }
}