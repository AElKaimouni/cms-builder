import config from "../config"
import { EnumStringField, FieldObject, FieldTypes, ModelObject, ModelPropsObject, RawSystemStatus, StringFieldArgs, SystemStatus, User, UserPerms, UserRole } from "../types";
import { FormInputs } from "./hooks";
import lodash from "lodash";

export const getUserToken = () : string | null => {
    return window.localStorage.getItem(config.USER_TOKEN_KEY);
}

export const setUserToken = (token: string) : void => {
    window.localStorage.setItem(config.USER_TOKEN_KEY, token); 
} 

export const getFormInputData = (inputs: FormInputs) => {
    const res = {};

    for(const input of inputs) {
        res[input.name] = input.defaultValue || (() => {
            switch(input.type) {
                default: return "";
            }
        })();
    }

    return res;
};

export const getFieldDefaultData = (field : FieldObject) : any => {
    const defaultArgs = field.__args ? field.__args.default : undefined;

    switch(field.__type) {
        case FieldTypes.Boolean: {
            const value = defaultArgs !== undefined ? defaultArgs : false
            return value
        };
        case FieldTypes.List: {
            const value = defaultArgs !== undefined ? defaultArgs : []
            return value;
        }
        case FieldTypes.Model: {
            return defaultArgs || null;
        }
        case FieldTypes.Number: {
            const value = defaultArgs !== undefined ? defaultArgs : 0;
            return value;
        }
        case FieldTypes.String: {
            const type = field.__args ? field.__args.type : undefined;
            switch(type) {
                case "color" : return "#000000";
                case "enum" : return (field.__args as EnumStringField).enums[0] || "";
            }

            const value = defaultArgs !== undefined ? defaultArgs : "";
            return value;
        }
    }
}

export const getPropsDefaultData = (props: ModelPropsObject | FieldObject) : any => {
    const isField = typeof props.__type === "string";
    if(!isField) {
        const data = {};
            Object.entries(props).forEach(([name, field]) => {
                data[name] = getPropsDefaultData(field);
            });
        return data;
    } else return getFieldDefaultData(props);
};

export const validateColor = (color: string) => {
    if(color && color.length === 4) return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
    else return color;
}

export const getPropsPreview = (props: ModelPropsObject, context: string = "") => {
    const res : { name: string | null, image: string | null } = { name: null, image: null };

    for(const [name, prop] of Object.entries(props)) {
        const propContext = (context ? context + "." : "") + name;
        const isField = typeof prop.__type === "string";
        if(isField && prop.__type === "model" && prop.__args.model === "media" && !prop.__args.multi) {
            res.image ||= propContext;
        } else if(isField && prop.__type === "string" && prop.__args.type === "short") {
            res.name ||= propContext;
        } else if(!isField) {
            const result = getPropsPreview(prop, propContext);

            if(result.name) res.name = result.name;
            if(result.image) res.image = result.image;
        }
    }

    return res;
};

export const getModelPreview = (model: ModelObject, data: any) => {
    switch(model.name) {
        case "media": return {
            name: data ? data.name : "",
            image: data
        };
    };

    const preview = model.preview || getPropsPreview(model.props);

    return {
        name: preview.input.name ? lodash.get(data, preview.input.name) : "",
        image: preview.input.image ? lodash.get(data, preview.input.image) : null
    }
};

export const getModelPreviewQuery = (model: ModelObject) : string => {
    switch(model.name) {
        case "media": return "{ _id url name }"
    }

    if(model.preview) {
        const propQuery = (prop: string |  string[]) : string => {
            if(typeof prop === "string") prop = prop.split(".");
            return `${prop[0]}${prop.length > 1 ? propQuery(prop.slice(1)) : ""}`;
        };
        let query = "{ _id " + propQuery(model.preview.input.name);
    
        if(model.preview.input.image) query += " " + propQuery(model.preview.input.image) + "{ url }";
    
        query += "}";

        return query;
    } else return "";
}

export const loopModelProps = (
    props: ModelPropsObject,
    callBack: (prop: FieldObject, name: string) => void,
    objectCallBack: (prop: ModelPropsObject, name: string) => void
) => {
    Object.entries(props).forEach(([key, prop]) => {
        const isField = typeof prop.__type === "string";

        if(isField) callBack(prop, key);
        else objectCallBack(prop, key);
    });
};


export const designModelFields = (model: ModelObject | ModelPropsObject, root: boolean = false) => {
    const main : ModelPropsObject[] = [{}, {}, {}, {}, {}, {}];
    const side : [ModelPropsObject, ModelPropsObject] = [{}, {}];
    const props = root ? (model as ModelObject).props : model as ModelPropsObject;

    loopModelProps(props, (prop, name) => {
        if(!root || name !== model.primary) switch(prop.__type) {
            case FieldTypes.String: {
                switch(prop.__args.type) {
                    case "styled": main[4][name] = prop; break;
                    case "long": main[3][name] = prop; break;
                    case "color": main[1][name] = prop; break;
                    default: main[0][name] = prop; break;
                }
            }; break;
            case FieldTypes.Number: main[0][name] = prop; break;
            case FieldTypes.Boolean: main[1][name] = prop; break;
            case FieldTypes.List: main[5][name] = prop; break;
            case FieldTypes.Model: {
                if(root) side[1][name] = prop;
                else main[2][name] = prop;
            }; break;
        } else side[0][name] = prop;
    }, (prop, name) => main[5][name] = prop);

    return root ? [...main, {...side[0], ...side[1]}] as ModelPropsObject[] : main;
};

export const getModelID = (model: any) : string | undefined => {
    return model._id || model.id;
}

export const matchQuery = (query: string) => {
    let items : [string, string?][] = [];
    let item = "";
    let sub = false;
    let count = 0;

    for(let i = 0; i < query.length; i++) {
        const lettre = query[i];
        if (lettre === " ") {
            if(item && !sub) {
                items.push([item]);
                item = "";
            } else if(sub) item += lettre;
        } else if(lettre === "{") {
            if(items.length) {
                if(sub) {
                    item += lettre;
                } else {
                    sub = true;
                }
                
                count++;
            }
        } else  if (lettre === "}") {
            if(sub) {
                count--;
                if(count === 0) {
                    sub = false;
                    items[items.length - 1].push(item);
                    item = "";
                } else {
                    item += lettre;
                }
            }
        } else {
            item += lettre;
        }

        if(i === query.length - 1 && item) items.push([item]);
    }

    return items;
}

export const parseModelPreveiwQuery = (query: string, context: string = "", res: {name: string, prop: string}[] = []) => {
    const matches = matchQuery(query);

    for(const match of matches) {
        const [prop, sub] = match;
        const key = context ? `${context}.${prop}` : prop;

        if(sub) parseModelPreveiwQuery(sub, key, res);
        else res.push({name: prop, prop: key});
    }

    return res;
}

export const normalizeModelName = (name: string) => {
    if(name.at(-1) === "s") return name.slice(0, -1);

    return name;
}

export const normalizePropName = (name: string) => {
    
    return name.replace(/_/g, " ");
}

export const parseStatus = (status: RawSystemStatus) : SystemStatus => {
    const domains = {};

    status.domains.forEach(domain => domains[domain.name] = domain);

    return {
        ...status,
        domains
    };
};

export const formatBytes = (bytes : number, decimals = 2) : string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

export const getModelByName = (name: string) => {
    const customModels = ["media", "user"];

    if(customModels.includes(name)) return { name } as ModelObject;

    else return window.__main_context.layout.models.find(m => m.name === name) as ModelObject;
}

export const validateLink = (link: string) => {
    return `${link[0] === "/" ? "" : "/"}${(link as string).at(-1) === "/" && link.length > 1 ? link.slice(0, -1) : link}`;
}

export const getUserRole = (userRole: UserRole) => {
    switch(userRole) {
        case UserRole.Admin: return "admin";
        case UserRole.Super_Admin: return "owner";
        case UserRole.Developer: return "developer";
        default: return "user";
    }
}

export const checkPerms = (user: User | undefined | null, check: (perms: UserPerms) => boolean) => {
    if(!user) return false;
    if(user.role < UserRole.Admin) return true;
    if(user.role === UserRole.Admin && check(user.perms)) return true;

    return false;
}

export const checkModelPerms = (user: User | undefined | null, model: string, crud: number) => {
    return checkPerms(user, perms => perms.models?.[model]?.[crud]);
}