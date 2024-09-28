import axios, { AxiosInstance, CreateAxiosDefaults } from "axios";
import { GetStaticPaths, GetStaticPropsContext } from "next";
import { ReactNode, useMemo } from "react";
import BuilderDevRoot, { BuilderDevRootProps } from "./comps/BuilderDevRoot";
import BuilderRoot from "./comps/BuilderRoot";
import {  BuilderComps, BuilderDevice, InitInfo } from "./types";
import {  ungroupSections } from "./utils";

export interface BuilderProps {
    info : InitInfo;
    api: CreateAxiosDefaults<any>;
}

export default class Builder {
    private info : InitInfo;
    private api : AxiosInstance;
    private sections: BuilderComps;
    private comps: BuilderComps;
    private elements: BuilderComps;
    private devices: { [key: string] : BuilderDevice };

    constructor({ info, api } : BuilderProps) {
        this.info = info;
        this.api = axios.create(api);
        this.sections = ungroupSections(this.info.sections);
        this.comps = ungroupSections(this.info.comps);
        this.elements = ungroupSections(this.info.elements);
        this.devices = {};

        for(const device of info.devices) {
            this.devices[device.name] = device;
        }
    }

    public getStaticProps = async ({ params, locale  } : GetStaticPropsContext<{ page?: string[] }>) => {
        const link = `/${params?.page ? params?.page.join("/") : ""}`;
        const res = await this.api.post("/page", { link, locale });
    
        return { props: { page: res ? res.data : null } }
    }

    public getStaticPaths: GetStaticPaths = async () => {
        const res = await this.api.get("/page/pages");
    
        return {
            paths: (res.data as string[]).map(url => url.replace(/^[^\\]*\\/,  "")),
            fallback: true,
        }
    }

    // public Root = ({ page } : { page: UiPage }) => {
    //     const decompressedPage = useMemo(() => decompressPage(page), [page])
        
    //     return <BuilderRoot
    //         InitInfo={this.info}
    //         page={decompressedPage}
    //     />
    // }

    public DevRoot = (callBack?: BuilderDevRootProps["callBack"]) => {
        return <BuilderDevRoot
            initInfo={this.info}
            sections={this.sections}
            comps={this.comps}
            elements={this.elements}
            devices={this.devices}
            callBack={callBack}
        />
    }
}