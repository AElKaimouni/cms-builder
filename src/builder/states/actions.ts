import React, { useEffect } from "react";
import { Action, ActionInput, ContextObject } from "../types";
import { toast } from 'react-toastify';
import { useBuilderContext } from ".";

type ActionsState = ContextObject["actions"]["state"];

export enum ActionsActions {
    AddAction,
    UndoAction,
    RedoAction,
    ClearActions
}

export type ActionsAction = 
    { type: ActionsActions.AddAction,  action: ActionInput } |
    { type: ActionsActions.UndoAction } |
    { type: ActionsActions.RedoAction } |
    { type: ActionsActions.ClearActions }
;

const actionsReducer = (state: ActionsState, action : ActionsAction) : ActionsState => {
    switch(action.type) {
        case ActionsActions.AddAction : {
            try {
                action.action.redo(true);

                            if(state.actions.length) {
                const lastAction = state.actions[state.actions.length - 1];

                if(lastAction.target && action.action.target && lastAction.target === action.action.target && state.activeAction === state.actions.length - 1) return {
                    ...state,
                    actions: [...state.actions.slice(0, state.activeAction), {
                        ...lastAction,
                        ...(action.action.stack ? {
                            redo: (firstTime) => {
                                lastAction.redo(firstTime);
                                action.action.redo(firstTime);
                            },
                            undo: () => {
                                action.action.undo();
                                lastAction.undo();
                            },
                        } : {
                            redo: action.action.redo,
                        }),
                        index: state.actions.length - 1
                    }]
                };
                else return {
                    actions: [...state.actions.slice(0, state.activeAction + 1), {
                        ...action.action,
                        index: state.actions.length
                    }],
                    activeAction: state.activeAction + 1
                };

            } else return {
                actions: [{ ...action.action, index: 0 }],
                activeAction: 0
            }

            } catch(err) { 
                window.__builder_context.layout.toast("Unknown Error.", { type: "error" });
                console.error(err);

                return state;
            }
        };
        case ActionsActions.UndoAction: {
            if(state.activeAction > -1) {
                const action = state.actions[state.activeAction];
                try {
                    action.undo();

                } catch(err) {
                    window.__builder_context.layout.toast("Unknown Error.", { type: "error" });
                    console.error(err);
                    
                    return state;
                }
                return {
                    ...state,
                    activeAction: state.activeAction - 1
                }
            } else return state;
        };
        case ActionsActions.RedoAction: {
            if(state.activeAction + 1 < state.actions.length) {
                const action = state.actions[state.activeAction + 1];
                try {
                    action.redo(false);

                } catch(err) {
                    window.__builder_context.layout.toast("Unknown Error.", { type: "error" });
                    console.error(err);
                    
                    return state;
                }

                return {
                    ...state,
                    activeAction: state.activeAction + 1
                }
            } else return state;
        };
        case ActionsActions.ClearActions: return { actions: [], activeAction: -1 };
        default : return state;
    }
};

export const useActions = (context?: ContextObject) => {
    const [state, dispatch] = React.useReducer(actionsReducer, context?.actions.state || { actions: [], activeAction: -1 });

    return {
        add: (action: ActionInput) => dispatch({ type: ActionsActions.AddAction, action }),
        undo: state.activeAction > -1 ? () => dispatch({ type: ActionsActions.UndoAction }) : null,
        redo: state.activeAction + 1 < state.actions.length ? () => dispatch({ type: ActionsActions.RedoAction }) : null,
        clear: () => dispatch({ type: ActionsActions.ClearActions }),
        state
    }
}