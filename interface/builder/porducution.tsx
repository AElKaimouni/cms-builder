import { GetStaticPaths, GetStaticPropsContext } from "next";
import { useEffect, useMemo } from "react";
import { BuilderComps, BuilderDevice, BuilderGroupedComps, InitInfo, ParsedPageDocument } from "./types";
import { decompressData, readRef } from "./utils/compressor";
import BuilderRoot, { BuilderRootProps } from "./comps/BuilderRoot";
import { ungroupSections, validateData } from "./utils";
import axios, { AxiosInstance } from "axios";
import { BuilderProps } from "./builder";

export default class Builder {
    private sections : BuilderComps;
    private comps : BuilderComps;
    private elements : BuilderComps;
    private info : InitInfo;
    private devices: { [key: string] : BuilderDevice };
    public api : AxiosInstance;


    constructor({ api, info } : BuilderProps) {
        this.sections = ungroupSections(info.sections);
        this.comps = ungroupSections(info.comps);
        this.elements = ungroupSections(info.elements);
        this.info = info;
        this.api = axios.create(api);
        this.devices = {};

        for(const device of info.devices) {
            this.devices[device.name] = device;
        }
    }


    public Root = ({ page, callBack } : { page: ParsedPageDocument, callBack?: BuilderRootProps["callBack"] }) => {
        return <>
            {page && <BuilderRoot
                initInfo={this.info}
                comps={this.comps}
                elements={this.elements}
                sections={this.sections}
                page={page}
                devices={this.devices}
                callBack={callBack}
            />}
        </>
    }

    public async validatePage(page: ParsedPageDocument) {
        for(let index = 0; index < page.locale.sections.length; index++) {
            let section = page.locale.sections[index];
            if(section.__ref) section = { ...section, ...readRef(section.__ref, page.models, page.symbols) };

            const comp = this.sections[section.comp];
            const data = [];

            for(const sdata of section.data) {
                data.push({
                    ...sdata,
                    data: await validateData(sdata.data, comp.props, this.comps, this.elements, page.models, page.symbols, this.api)
                })
            }

            page.locale.sections[index] =  {
                ...section,
                data
            };
        }

        return page;
    }
}