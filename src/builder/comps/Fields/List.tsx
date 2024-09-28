import { BuilderField, BuilderFieldMethods, BuilderFieldMethodsProps } from ".";
import { Field, ListData, ListField } from "../../classes";
import { Add2Icon, ArrowDownIcon, ArrowUpIcon, DeleteIcon, DublicateIcon, ListIcon, ResetIcon } from "../../icons";
import { LayoutActions, useBuilderContext } from "../../states";
import { BuilderModals } from "../../utils/modals";

interface BuilderListFieldProps {
    label: string;
    data: ListData;
    reset?: boolean;
    methods?: BuilderFieldMethodsProps["methods"];
}

export const BuilderListField = ({ data, label, reset, methods } : BuilderListFieldProps) => {
    const { layout } = useBuilderContext();

    return (
        <div className="__Builder-Field __Builder-List-Field">
            <div className="__Builder-Fields-Group-Label __Builder-List">
                <label>
                    <ListIcon />{label}
                </label>
                <button onClick={() => {
                    if(!data?.__dynamicList) data?.add();
                    else {
                        const comps = Object.keys((data?.__props as ListField).__args.props);
                        layout.set({ type: LayoutActions.Modal, modal: BuilderModals.CompsModal, comps, callBack: comp => {
                            data?.add(undefined, undefined, undefined, true, comp);
                        } });
                    }
                }}>
                    <Add2Icon />
                </button>
                {methods && <BuilderFieldMethods methods={methods} />}
                {reset && <button onClick={() => {}}>
                    <ResetIcon />
                </button>}
            </div>
            {data?.map((ldata, index) => (
                <BuilderField methods={[
                    {
                        icon: <DublicateIcon />,
                        callBack: () => ldata.__dublicate()
                    },
                    {
                        icon: <DeleteIcon />,
                        callBack: () => ldata.__delete()
                    },
                    {
                        icon: <ArrowUpIcon />,
                        callBack: () => ldata.__index > 0 ? ldata.__move(ldata.__index - 1) : undefined
                    },
                    {
                        icon: <ArrowDownIcon />,
                        callBack: () => ldata.__index < data.length - 1 ? ldata.__move(ldata.__index + 2) : undefined
                    }
                ]} key={ldata.__id} data={ldata} label={ldata.__data.__name || `item ${index + 1}`} reset={reset} />
            ))}
        </div>
    )
};