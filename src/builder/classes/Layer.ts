import { PageActions } from "../states";
import { BuilderComp, CompLayerArgs, CompPropsObject, DataLayerArgs, ExpandedChildLayer, ExpandedCompLayer, ExpandedDataLayer, ExpandedLayer, ExpandedListItemLayer, ExpandedListLayer, ExpandedSectionLayer, FieldObject, FieldTypes, LayerArgs, LayerBaseArgs, LayerInput, LayersTypes, ListItemLayerArgs, ListLayerArgs, PageDataCondObject, PageSectionObject, SectionDataLayerArgs, SectionLayerArgs } from "../types";
import { Data, ListData, ListItemData, SectionData } from "./Data";
import { CompField, Field, ListField, Props } from "./Props";
import { PageSection, PageSections } from "./Section";

let layersCounters = 0;

export type LayerClass = SectionLayer | CompLayer | ListLayer | ListItemLayer;
export class Layers {
    public root: boolean;
    public length: number;
    public expanded: {indexed: ExpandedLayer[], fixed: ExpandedLayer[]};
    public fixed: LayerClass[];
    [key: number] : LayerClass;
    constructor(items: LayerInput[] | PageSections) {
        const context = window.__builder_context;
        this.root = items instanceof PageSections;
        this.length = items.length;

        for(let index = 0; index  < this.length; index++) {
            if(this.root) {

                const layer = items[index] as PageSection;
                const section = context.wapi.sections[layer.comp];
                
                this[index] = Layer.create({
                    data: layer.data,
                    name: layer.name || layer.comp,
                    props: section.props,
                    type: LayersTypes.Section,
                    section: layer
                }) as SectionLayer;

                layer.layer = this[index] as SectionLayer;
            } else {
                const layer = items[index] as LayerInput;
                const layerArgs: LayerBaseArgs = (() => {
                    if(layer.props instanceof Props || layer.props instanceof Field) {
                        return layer as LayerBaseArgs;
                    } else {
                        const isField = typeof layer.props.__type === "number";
                        const props = isField ? Field.__create(layer.props as FieldObject) : Props.create(layer.props as CompPropsObject);
        
                        return { ...layer, props  }
                    } 
                })();

                this[index] = Layer.create((() => {
                    switch(layerArgs.type) {
                        case LayersTypes.Section: throw new Error("Cannot Create Sction Layer From Here.");
                        default: return layerArgs as LayerArgs;
                    }
                })()) as LayerClass;
            }
        }

        this.fixed = [];
        if(items instanceof PageSections) for(const layer of items.fixed) {
            const section = context.wapi.sections[layer.comp];
        
            this.fixed.push(Layer.create({
                data: layer.data,
                name: layer.name || layer.comp,
                props: section.props,
                type: LayersTypes.Section,
                section: layer
            }) as SectionLayer);

            layer.layer = this.fixed[this.fixed.length - 1] as SectionLayer;
        }

        this.expanded = { fixed: [], indexed: [] };
        this.expand();
    }



    public each(callBack: (layer: LayerClass, index: number) => void) {
        for(let i = 0; i < this.length; i++) {
            callBack(this[i], i);
        }
    }

    public map(callBack: (layer: LayerClass) => {}) {
        const map : any[] = [];

        this.each((layer, index) => {
            map[index] = callBack(layer);
        })

        return map;
    }

    public appendLayer(layer: LayerClass, index: number) {
        if(layer instanceof SectionLayer && layer.section.fixed) {
            this.fixed.splice(index, 0, layer);
            this.expanded.fixed.splice(index, 0, layer.expanded);
        } else {
            for(let i = this.length; i >= index ; i--) this[i] = this[i - 1];

            this[index] = layer;
            this.length++;

            this.expanded.indexed.splice(index, 0, layer.expanded);
        }
    }

    public deleteLayer(index: number, fixed: boolean = false) {
        if(fixed) {
            this.fixed.splice(index, 1);

            this.expanded.fixed.splice(index, 1);
        } else {
            for(let i = index ; i < this.length; i++) {
                this[i] = this[i + 1];
            }
    
            this.length--;
            delete this[this.length];
    
            this.expanded.indexed.splice(index, 1);
        }
    }

    public moveLayer(sindex: number, dindex: number) {
        const s_layer = this[sindex];
        this.deleteLayer(sindex, false);
        this.appendLayer(s_layer, dindex);
    }

    static updateState() { 
        const context = window.__builder_context;
        const page = window.__builder_page;
        if(page && context) {
            const rootLayers = page.locale.sections.layers;

            // we know that root layers are section layers
            context.page.set({ type: PageActions.Setlayers, layers: rootLayers.expanded as any });
        }
    }

    public expand() { // high cost method
        for(let i = 0; i < this.length; i++) {
            this.expanded.indexed[i] = this[i].expanded;
        }
        for(let i = 0; i < this.fixed.length; i++) {
            this.expanded.fixed[i] = this.fixed[i].expanded;
        }
    }
}
export class Layer {
    private props: Props | Field;
    public data: Data;
    public name: string;
    public type: LayersTypes;
    public childs: Layers;
    public id: number;
    public parent: SectionLayer | Layer | null;
    public toggle: (val : boolean) => void;
    public isOpen: boolean;
    constructor(args: LayerBaseArgs) {
        this.props = args.props;
        this.data = args.data;
        this.name = args.name;
        this.type = args.type;
        this.parent = args.parent;
        this.toggle = () => {};
        this.isOpen = false;

        this.childs = this.getChilds();

        this.data.__layer = this;
        this.id = layersCounters++;
    }

    get activeChilds() {
        return this.childs;
    }

    get map() : [...Layer[], SectionLayer] {
        const map : (Layer | SectionLayer)[] = [];
        let layer : Layer | SectionLayer | SectionDataLayer | null = this;

        while(layer) {
            if(!(layer instanceof SectionDataLayer)) {
                map.push(layer);
            }

            layer = layer.parent;
        }

        return map as [...Layer[], SectionLayer];
    } 

    public getChilds() {
        const context = window.__builder_context;

        if(this.props instanceof Field) {
            if(this.props instanceof CompField) {
                const compName = this.props.__args.comp;
                const comp = context.wapi.comps[compName] || context.wapi.elements[compName];

                return new Layers(comp.props instanceof Props ? Layer.expand(comp.props, this.data, this) : []);
            } else if (this.props instanceof ListField) {
                const data = this.data as ListData;
                const layers: LayerInput[] = data.map<LayerInput>((data, index) => ({
                    data: data,
                    name: data.__dynamicComp || `item ${index}`,
                    props: this.data.__dynamicList ? (this.props as ListField).__args.props[data.__dynamicComp] : (this.props as ListField).__args.props,
                    type: LayersTypes.ListItem,
                    parent: this
                }));
                
                return new Layers(layers);
            } else return new Layers([]);
        } else return new Layers(Layer.expand(this.props, this.data, this));
    }

    public raname(name: string) {
        this.name = name;
    }

    static expand(props: Props, data: Data, parent: Layer | null) : LayerInput[] {
        let layers : LayerInput[] = [];
            
        props.__each((prop, name) => {
            layers.push({
                props: prop instanceof CompField ? prop.__props : prop,
                name,
                data: data.__read(name),
                type: (() => {
                    if(prop instanceof CompField || prop instanceof Props) return LayersTypes.Comp;
                    if(prop instanceof ListField) return LayersTypes.List;
                    
                    return LayersTypes.Data;
                })(),
                parent
            })
        })

        return layers;
    }

    static create(args?: LayerArgs) : LayerClass | Layer | SectionLayer | SectionDataLayer | ListLayer | ListItemLayer | DataLayer {
        const defaultLayer = () => new Layer({
            name: "",
            data: new Data({}, new Props({}), new SectionData({
                __name: "",
                comp: "",
                cond : { media: [] },
                data: []
            }, new PageSection({
                __name: "",
                comp: "",
                cond : { media: [] },
                data: []
            })), { media: [] }, "", {} as any),
            props: new Props({}),
            type: LayersTypes.Section,
            parent: null
        });

        if(args) switch(args.type) {
            case LayersTypes.SectionData: return new SectionDataLayer(args);
            case LayersTypes.Section: return new SectionLayer(args);
            case LayersTypes.Comp: return new CompLayer(args);
            case LayersTypes.List: return new ListLayer(args);
            case LayersTypes.ListItem: return new ListItemLayer(args);
            case LayersTypes.Data: return new DataLayer(args);
            default:  return defaultLayer()
        } else return defaultLayer();
    }

    public foucs() {
        let currLayer : Layer | SectionLayer = this;
        const layers : Layer[] = [];
        
        while(currLayer instanceof Layer) {
            currLayer = currLayer.parent as Layer | SectionLayer;
            if(currLayer instanceof Layer) {
                currLayer.isOpen = true;
                layers.unshift(currLayer);
            }
        }

        currLayer.toggle(true);
        layers.forEach(layer => layer.toggle(true));
        
        Layer.focus(this.id);
    }

    static focus(laterID: number) {
        window.setTimeout(() => {
            const element = document.getElementById(`__Builder-Layer-${laterID}`);
            const container = document.getElementById(`__Builder-Layers-Container`);
            if(element instanceof HTMLElement && container instanceof HTMLElement) {
                const containerRect = container.getBoundingClientRect();

                container.scrollTop = Math.max(element.offsetTop - containerRect.top - containerRect.height / 2, 0);
            }
        }, 0)
    }
}
export class SectionDataLayer extends Layer {
    public type: LayersTypes.Section;
    constructor(args: SectionDataLayerArgs) {
        super(args);
        this.type = LayersTypes.Section;
    }
}
export class SectionLayer {
    private props: Props | Field;
    public name: string;
    public childs: { cond: PageDataCondObject, layers: Layers }[];
    public id: number;
    public type: LayersTypes.Section;
    public section: PageSection;
    public expanded: ExpandedSectionLayer;
    public parent: null;
    public toggle: (val : boolean) => void;
    public isOpen: boolean;
    protected data: SectionData;
    constructor(args: SectionLayerArgs) {
        this.props = args.props;
        this.data = args.data;
        this.name = args.name;
        this.type = args.type;
        this.parent = null;
        this.toggle = () => {};
        this.isOpen = false;

        this.childs = this.getChilds();

        this.data.data.forEach(data => {
            data.data.__layer = this;
        })
        this.id = layersCounters++;

        this.type = LayersTypes.Section;
        this.section = args.section;
        this.expanded = this.expand();
    }

    get activeChilds() {
        const targets = window.__builder_context.targets;

        for(let child of this.childs) {
            if(child.cond.media.includes(targets.device.name)) {
                return child.layers;
            }
        }

        return new Layers([]);
    }

    public getChilds() {
        this.childs =  this.data.data.map(data => {
            const layer =  Layer.create({
                type: LayersTypes.SectionData,
                data: data.data,
                name: this.name,
                props: this.props,
                parent: this
            }) as Layer;

            return {
                cond: data.cond,
                layers: layer.childs
            }
        });

        return this.childs;
    }

    public expand() : ExpandedSectionLayer {
        this.expanded =  {
            name: this.name,
            childs: this.childs.map(child => ({
                cond: child.cond,
                // as ExpandedChildLayer cuz childs of section layer cannot be section layer
                layers: child.layers.expanded.indexed as any 
            })),
            type: this.type,
            section: this.section,
            data: this.data,
            cond: this.section.cond,
            id: this.id,
            layer: this
        }

        return this.expanded;
    };

    public raname(name: string) {
        this.name = name;
        this.expanded.name = name;
    }

    public foucs() {
        this.toggle(true);
        
        Layer.focus(this.id);
    }
}

export class DataLayer extends Layer {
    public type: LayersTypes.Data;
    public expanded: ExpandedDataLayer;
    constructor(args: DataLayerArgs) {
        super(args);

        this.type = LayersTypes.Data;
        this.expanded = this.expand();
    }

    public expand() : ExpandedDataLayer {
        return {
            name: this.name,
            childs: this.childs.expanded.indexed,
            type: this.type,
            data: this.data,
            id: this.id,
            layer: this
        }
    };

    public raname(name: string) {
        this.name = name;
        this.expanded.name = name;
    }
}

export class CompLayer extends Layer {
    public type: LayersTypes.Comp;
    public expanded: ExpandedCompLayer;
    constructor(args: CompLayerArgs) {
        super(args);

        this.type = LayersTypes.Comp;
        this.expanded = this.expand();
    }

    public expand() : ExpandedCompLayer {
        return {
            name: this.name,
            childs: this.childs.expanded.indexed,
            type: this.type,
            data: this.data,
            id: this.id,
            layer: this
        }
    };

    public raname(name: string) {
        this.name = name;
        this.expanded.name = name;
    }
}
export class ListLayer extends Layer {
    public type: LayersTypes.List;
    public data: ListData;
    public expanded: ExpandedListLayer;
    constructor(args: ListLayerArgs) {
        super(args);

        this.type = LayersTypes.List;
        this.data = args.data as ListData;
        this.expanded = this.expand();
    }

    public expand() : ExpandedListLayer {
        return {
            name: this.name,
            childs: this.childs.expanded.indexed,
            type: this.type,
            data: this.data,
            id: this.id,
            layer: this
        }
    };

    public raname(name: string) {
        this.name = name;
        this.expanded.name = name;
    }
}

export class ListItemLayer extends Layer {
    public type: LayersTypes.ListItem;
    public data: ListItemData;
    public expanded: ExpandedListItemLayer;
    constructor(args: ListItemLayerArgs) {
        super(args);

        this.type = LayersTypes.ListItem;
        this.data = args.data as ListItemData;
        this.expanded = this.expand();
    }

    public expand() : ExpandedListItemLayer {
        return {
            name: this.name,
            childs: this.childs.expanded.indexed,
            type: this.type,
            data: this.data,
            id: this.id,
            layer: this
        }
    };

    public raname(name: string) {
        this.name = name;
        this.expanded.name = name;
    }
}