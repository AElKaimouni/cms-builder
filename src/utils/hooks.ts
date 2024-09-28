import React, { Dispatch, useEffect, useMemo, useState } from "react";
import { designModelFields, getFormInputData, getPropsDefaultData } from "./functions";
import { FormActions, fromReducer } from "./reducers";
import { FormData } from "../utils";
import { FieldObject, ModelObject, ModelPropsObject } from "../types";
import { ModelProps } from "../modules";
import { ModelAPi } from "../APIs";
import { useMainContext } from "../states";
import { validateField, validateUniqueField } from "./validators";
import lodash from "lodash";

type InputProps = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
export type FormInputs = (InputProps & {
    name: string;
    label?: string;
    validator?: (value: any, data: FormData) => string;
    values?: string[];
})[]

export const useForm = (inputs: FormInputs) => {
    const initData = getFormInputData(inputs);
    const [errors, setErrors] = React.useReducer(fromReducer(), {});
    const [data, set] = React.useReducer(fromReducer(setErrors, inputs), initData);
    const isValid = React.useMemo(() => {
        for(let prop in errors) if(errors[prop]) return false;

        return true;
    }, [errors]);
    const formController = {
        clearProp: (prop: string) => set({ type: FormActions.SET, prop, value: "" }),
        clearAll: () => set({ type: FormActions.SET_ALL, data: initData })
    }


    return {data, isValid, setErrors, errors, set, inputs, formController};
}

export const useLoader = (init: boolean = false) => {
    const [loading, set] = useState<boolean>(init);
    const controller = {
        start: () => set(true),
        end: () => set(false),
        process: async (callBack: () => Promise<void>) => {
            set(true);
            await callBack();
            set(false);
            return;
        }
    };

    return [loading, controller] as [boolean, typeof controller];
};

export const useError = () => {
    const [error, set] = useState<string>("");

    return { error, set, clear: () => set("") };
};

export const useList = <Type = string>(initActive: Type | null = null) => {
    const [active, set] = useState<Type | null>(initActive);

    return {
        state: [active, set] as [typeof active, typeof set],
        active: (item: Type) => set(item),
        isActive: (item: Type) => active === item
    }
}

export const usePanigration = (init: number = 0, count: number) => {
    const { active, isActive, state } = useList<number>(init);
    const canNext = useMemo(() => state[0] as number + 1 < count, [count, state[0]]);
    const canPrev = useMemo(() => state[0] as number > 0, [count, state[0]]);


    return {
        page: state[0] as number,
        isPage: isActive,
        browse: active,
        canNext, canPrev,
        next: () => active(state[0] as number + 1),
        prev: () => active(state[0] as number - 1),
    }; 
}

export const useModal = () => {
    const [active, setActive] = useState<boolean>(false);

    return {
        opened: active,
        open: () => setActive(true),
        close: () => setActive(false)
    }
}

export const useModelProps = (init: ModelPropsObject, onDelete: () => void) => {
    const [props, setProps] = useState<ModelPropsObject>(init);
    const controller = new ModelProps(props, setProps, onDelete);

    return controller;
}

export const useTags = () => {
    const [tags, setTags] = useState<string[]>([]);

    return {
        tags,
        add: (tag: string) => setTags([...tags, tag]),
        delete: (tag: string) => setTags(tags.filter(t => t !== tag)),
        clear: () => setTags([]) 
    }
}

export const useTable = <Type = any>(initLoad: (config : { page: number, max: number, sort?: string, search?: string }) => Promise<{ models: Type[], count: number }>, initMax?: number) => {
    const [models, setModels] = useState<Type[]>();
    const [count, setCount] = useState<number>();
    const [pageMaxItems, setPageMaxItems] = useState<number>(initMax || 20);
    const [sort, setSort] = useState<string>("NEWEST");
    const [search, setSearch] = useDelayState<string>("", 500);
    const [loading, loadingController] = useLoader(true);
    const [load, setLoad] = useState<typeof initLoad>(() => initLoad);
    const panigrationController = usePanigration(0, Math.ceil((count || 0)/pageMaxItems));

    const { page } = panigrationController;
    const refresh = () => loadingController.process(async () => {
        const { models, count } = await load({ page, sort, max: pageMaxItems, search });

        setModels(models);
        setCount(count)
    });

    useEffect(() => {
        refresh();
    }, [page, pageMaxItems, sort, search, load]);

    return {
        clear: () => { setModels(undefined); setCount(undefined); },
        models,
        count,
        setLoad,
        pageController: panigrationController,
        loading,
        loader: loadingController,
        sort: [sort, setSort] as [string, Dispatch<string>],
        max: [pageMaxItems, setPageMaxItems] as [number, Dispatch<number>],
        search: [search, setSearch] as [string, Dispatch<string>],
        refresh
    };
}

export const useSelect = (init: string[] = [], initMax?: number) => {
    const [max, setMax] = useState<number>(initMax || 99999);
    const [state, setState] = useState<string[]>(init);

    return {
        isActive: (id: string) => state.includes(id),
        switchItem: (id: string) => {
            if(state.includes(id)) {
                setState(state.filter(item => item !== id))
            } else {
                if(max === undefined || state.length < max) {
                    setState(state.concat([id]))
                } else {
                    setState(state.slice(1).concat([id]))
                }
            }
        },
        state,
        clear: () => setState([]),
        setMax, max, setState
    };
}

export const useDelayState = <Type = any>(init: Type, delay: number = 500) => {
    const [value, setValue] = useState<Type>(init);
    const [state, setState] = useState<Type>(init);

    useEffect(() => {
        const timer = setTimeout(() => {
            setState(value);
        }, delay);

        return () => clearTimeout(timer);
    }, [value]);

    return [ state, setValue ] as [typeof state, typeof setValue];
};

export const useModelTable = (model: ModelObject, query?: string, initMax?: number) => {
    const { status: { defaultLocale }, controller: { router } } = useMainContext();
    const selectController = useSelect();
    const localeController = useList(router.searchParams.get("locale") || defaultLocale);
    const loadFunction = () => async (info) => {
        return await ModelAPi.table({
            max: info.max,
            model: model.name,
            skip: info.page * info.max,
            query,
            search: info.search,
            sort: info.sort,
            locale: model.i18n ? localeController.state[0] || undefined : undefined
        });
    };
    const controller = useTable(loadFunction(), initMax);

    useEffect(() => {
        controller.setLoad(loadFunction);
        controller.loader.start();
        controller.clear();
    }, [model, localeController.state[0]])

    return {...controller, select: selectController, locale: localeController };
}

export const useSwitch = (init: boolean = false) => {
    const [state, setState] = useState<boolean>(init);

    return [state, () => setState(s => !s)] as [boolean, () => void]
}

export const useDataLoader = <Type = any>(
    load: () => Promise<Type>,
    loader: ReturnType<typeof useLoader>[1],
    params: React.DependencyList,
    init?: Type
) => {
    const [data, setData] = useState<Type | undefined>(init);
    const [initData, setInitData] = useState<Type | undefined>(init);

    useEffect(() => {
        loader.process(async () => loader.process(async () => {
            const data = await load()
            if(data) {
                setData(data);
                setInitData(data);
            }
        }));
    }, params);

    return [data, setData, initData, data => {
        setData(data as any);
        setInitData(data as any);
    }] as [Type, React.Dispatch<React.SetStateAction<Type>>, Type, React.Dispatch<React.SetStateAction<Type>>];
}

export const useInitData = <Type>(init?: Type) => {
    const [data, setData] = useState<Type | undefined>(init);
    const [initData, setInitData] = useState<Type | undefined>(init);

    return [initData, data, setData, setInitData] as [typeof initData, typeof data, typeof setData, typeof setInitData];
}

export const useFieldValidator = (initValue: any, value: any, args: FieldObject["__args"], loading?: boolean, context?: string) => {
    let signal : AbortController | undefined;
    const [locale, model, id, fieldName] = useMemo(() => context?.match(/^([^_]+)_([^_]+)_([^\.]*)\.(.*)$/)?.slice(1) || [null, null, null, null], [context]);
    const [delayedValue, setDelayedValue] = useDelayState(value);
    const [uniqueloading, uniqueLoader] = useLoader();
    const [customError, setCustomError] = useState<string>("");
    const [uniqueError, setUniqueError] = useState<string>("");
    const error = useMemo(() => customError || uniqueError, [customError, uniqueError]);

    useEffect(() => {
        if(!loading) {
            setDelayedValue(value);
            setCustomError(validateField(value, args) || "");
            if(args.validate?.unique && !lodash.isEqual(initValue, value)) uniqueLoader.start();
        }
    }, [value]);
    

    useEffect(() => {
        if(!loading) {
            if(lodash.isEqual(initValue, value)) {
                setUniqueError("");
                uniqueLoader.end();
            } else if(locale && model && fieldName && !customError) {
                if(signal) signal.abort();
                signal = new AbortController();
    
                validateUniqueField(delayedValue, args,   {
                    field: fieldName,
                    model: model,
                    locale: locale,
                    id: id || undefined
                }, signal).then(error => {
                    setUniqueError(error || "");
                    uniqueLoader.end();
                });
            } else uniqueLoader.end();
        }
    }, [delayedValue]);

    return [error, uniqueloading];
}