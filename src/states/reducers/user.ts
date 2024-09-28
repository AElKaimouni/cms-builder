import React from "react";
import { MainContextObject } from "../../types";
import { User } from "../../types/users";

export enum UserActions {
    SET
};

export type UserAction = { type: UserActions.SET, user: User | null };

export const userReducer = (state: MainContextObject["user"], action: UserAction) => {
    switch(action.type) {
        case UserActions.SET: return action.user;
        default: return state;
    }
}