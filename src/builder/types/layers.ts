import { Data, Field, Layer, ListData, ListItemData, PageSection, Props, SectionData, SectionLayer } from "../classes";
import { CompPropsObject } from "./comps";
import { FieldObject } from "./fields";
import { PageDataCondObject, PageSectionObject } from "./page";

export interface LayerInput {
    props: CompPropsObject | FieldObject | Props | Field,
    data: Data,
    name: string,
    type: LayersTypes
    parent: Layer["parent"];
};
export enum LayersTypes {
    Section, Comp, List, ListItem, SectionData,
    Data
}

export interface ExpandedLayerBase {
    name: string;
    childs: ExpandedLayer[];
    data: Data;
    id: number;
    layer: Layer;
}

export interface LayerBaseArgs {
    props: Layer["props"];
    data: Layer["data"];
    name: Layer["name"];
    type: Layer["type"];
    parent: Layer["parent"];
}

export interface SectionLayerArgs {
    type: LayersTypes.Section;
    section: SectionLayer["section"];
    data: SectionLayer["data"];
    props: Layer["props"];
    name: Layer["name"];
}

export interface SectionDataLayerArgs extends LayerBaseArgs {
    type: LayersTypes.SectionData;
}
export interface CompLayerArgs extends LayerBaseArgs {
    type: LayersTypes.Comp;
}


export interface ListLayerArgs extends LayerBaseArgs {
    type: LayersTypes.List;
}

export interface ListItemLayerArgs extends LayerBaseArgs {
    type: LayersTypes.ListItem;
}

export interface DataLayerArgs extends LayerBaseArgs {
    type: LayersTypes.Data;
}

export type LayerArgs = 
    SectionLayerArgs |
    CompLayerArgs |
    ListLayerArgs |
    ListItemLayerArgs |
    SectionDataLayerArgs |
    DataLayerArgs
;

export interface ExpandedSectionLayer {
    type: LayersTypes.Section;
    section: PageSection;
    layer: SectionLayer;
    cond: PageDataCondObject;
    name: string;
    data: SectionData;
    id: number;
    childs: {
        cond: PageDataCondObject;
        layers: ExpandedChildLayer[];
    }[]
};

export interface ExpandedCompLayer extends ExpandedLayerBase {
    type: LayersTypes.Comp;
}

export interface ExpandedDataLayer extends ExpandedLayerBase {
    type: LayersTypes.Data;
}


export interface ExpandedListLayer extends ExpandedLayerBase {
    type: LayersTypes.List;
    data: ListData;
}

export interface ExpandedListItemLayer extends ExpandedLayerBase {
    type: LayersTypes.ListItem;
    data: ListItemData;
}

export type ExpandedLayer = 
    ExpandedSectionLayer |
    ExpandedCompLayer |
    ExpandedListLayer |
    ExpandedListItemLayer |
    ExpandedDataLayer
;

export type ExpandedChildLayer = 
    ExpandedCompLayer |
    ExpandedListLayer |
    ExpandedListItemLayer
;