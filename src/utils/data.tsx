import { ReactNode } from "react";
import { ModelAPi } from "../APIs";
import { FieldObject, FieldTypes, MainContextObject } from "../types";
import { User, UserRole } from "../types/users";
import { BuildIcon, CollectionIcon, DesignIcon, HomeIcon, MediaIcon, PagesIcon, SettingIcon, UsersIcon } from "./icons";
import { Domain } from "../types/domain";
import { PageObject } from "../types/pages";
import { Media } from "../types/media";
import { checkModelPerms } from "./functions";

export const setupSideBars = async (user: User): Promise<MainContextObject["layout"]["sidebars"]> => {
    const models = await ModelAPi.fetchModels();
    const modelsBars = models.filter(m => checkModelPerms(user, m.name, 1)).map(model => ({
        title: model.name,
        link: `/models/preview/${model.name}`,
        icon: <></>
    }));
    return {
        up: [
            ...(modelsBars.length ? [
                {
                    name: "Collections",
                    icon: <CollectionIcon />,
                    bars: modelsBars
                }
            ] : []),
            ...(user.role === UserRole.Developer ? [
                {
                    title: "domains",
                    link: "/domains",
                    icon: <HomeIcon />
                }
            ] : []),
            ...(checkModelPerms(user, "pages", 1) ? [
                {
                    title: "pages",
                    link: "/pages",
                    icon: <PagesIcon />
                }
            ] : []),
            ...(checkModelPerms(user, "media", 1) ? [
                {
                    title: "media",
                    link: "/media",
                    icon: <MediaIcon />
                }
            ] : []),
            ...(checkModelPerms(user, "users", 1) ? [
                {
                    title: "users",
                    link: "/users",
                    icon: <UsersIcon />
                }
            ] : [])
        ], down: [
            ...(checkModelPerms(user, "pages", 1) ? [
                {
                    title: "builder",
                    link: "/admin/builder",
                    icon: <DesignIcon />,
                    blank: true
                }
            ] : []),
            {
                title: "settings",
                link: "/settings",
                icon: <SettingIcon />
            }
        ] 
    }
}

export const fieldsTemplates : {
    name: string;
    icon: ReactNode;
    props: null | FieldObject;
}[] = [
    {
        name: "Text Field",
        icon: <DesignIcon />,
        props: {
            __type: FieldTypes.String,
            __args: {
                type: "short"
            }
        }
    },
    {
        name: "Enums Field",
        icon: <DesignIcon />,
        props: {
            __type: FieldTypes.String,
            __args: {
                type: "enum",
                enums: ["enum 1", "enum 2", "enum 3"]
            }
        }
    },
    {
        name: "Color Field",
        icon: <DesignIcon />,
        props: {
            __type: FieldTypes.String,
            __args: {
                type: "color"
            }
        }
    },
    {
        name: "Date Field",
        icon: <DesignIcon />,
        props: {
            __type: FieldTypes.String,
            __args: {
                type: "date"
            }
        }
    },
    {
        name: "Number Field",
        icon: <DesignIcon />,
        props: {
            __type: FieldTypes.Number,
            __args: {
                type: "float"
            }
        }
    },
    {
        name: "Booelan Field",
        icon: <DesignIcon />,
        props: {
            __type: FieldTypes.Boolean,
            __args: {}
        }
    },
    {
        name: "Media Field",
        icon: <DesignIcon />,
        props: {
            __type: FieldTypes.Model,
            __args: {
                model: "media"
            }
        }
    },
    {
        name: "Model Field",
        icon: <DesignIcon />,
        props: {
            __type: FieldTypes.Model,
            __args: {
                model: "media"
            }
        }
    },
    {
        name: "List Field",
        icon: <DesignIcon />,
        props: {
            __type: FieldTypes.List,
            __args: {
                props: {}
            }
        }
    },
    {
        name: "Object Field",
        icon: <DesignIcon />,
        props: null
    }
];

export const modelTypes = [
    FieldTypes.Boolean,
    FieldTypes.List,
    FieldTypes.Model,
    FieldTypes.Number,
    FieldTypes.String
]

export const defaultDomain : Domain= {
    host: "",
    name: "",
    theme: {},
    published: false,
    _id: "",
    created_at: new Date(),
    created_by: { name: "" } as User
}

export const defaultPage : PageObject = {
    _id: "",
    created_at: new Date(),
    created_by: { name: "" } as User,
    domain: defaultDomain,
    link: "",
    locales: [],
    models: {},
    name: "",
    published: false,
    slug: "",
    symbols: {},
    targets: {
        locales: false
    },
    url: "",
    versions: [],
}

export const defaultProfileAvatar = { url: "/admin/images/users/avatar.jpg", type: "image" } as Media;