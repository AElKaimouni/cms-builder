import { useEffect, useMemo, useState } from "react";
import { Loader, Modal, ModelPreview, Panigration } from "../../comps";
import { getModelPreviewQuery, useModal, useTable, usePanigration, useSelect, checkModelPerms } from "../../utils";
import { ModelObject } from "../../types";
import { ModelAPi } from "../../APIs";
import { useMainContext } from "..";
import { useSearchParams } from "react-router-dom";
import { UploadIcon } from "../../utils/icons";

export type ModalPickerCallBack = (models: any[]) => void;

export const useModelPickerModal = () => {
    const [searchParams] = useSearchParams();
    const [model, setModel] = useState<ModelObject>();
    const [callBack, setCallBack] = useState<ModalPickerCallBack>(() => (() => {})); 
    const modalController = useModal();
    const tableController = useTable<any>(
        async () => ({ count: 0, models: [] })
    );
    const selectController = useSelect();

    return {
        modalController, selectController, model, tableController, callBack,
        open: (model: ModelObject, callback: ModalPickerCallBack, max?: number) => {
            const urlParams = new URLSearchParams(window.location.search);
            tableController.setLoad(() => (async ({ max, page, sort, search }) => {
                if(model) return await ModelAPi.table({
                    model: model.name,
                    max, sort,
                    skip: page * max,
                    // query: getModelPreviewQuery(model),
                    search,
                    locale : urlParams.get("locale") || undefined
                }); else return { count: 0, models: [] };
            }) as any);
            setModel(model);
            setCallBack(() => callback);
            selectController.setMax(max || 99999);
            selectController.clear();
            modalController.open();
            tableController.pageController.browse(0)
        },
        close: () => {
            modalController.close();
            tableController.clear();
        }
    };
}

interface Props {
    controller: ReturnType<typeof useModelPickerModal>;
}

export default ({ controller } : Props) => {
    const { user, controller: { modals } } = useMainContext();
    const { modalController, tableController, selectController, model, callBack, close } = controller;
    const { switchItem, isActive, state } = selectController;
    const { count, max: [max, setMax], loading, models } = tableController;
    const [ sort, setSort ] = tableController.sort;
    const [ search, setSearch ] = tableController.search;

    return (
        <Modal id="model-picker-modal" controller={modalController} footer={(
            <>
                <div id="model-picker-modal-footer-left">
                    <Panigration controller={tableController.pageController} count={Math.ceil((count || 0) / (max || 1))} />
                </div>
                
                <button id="confirm-modal-cancel" className="app-button" onClick={close}>Cancel</button>
                <button disabled={!state.length} id="confirm-modal-confirm" className="app-button primary" onClick={() => {
                    close();
                    callBack(state.map(id => tableController.models?.find(m => m._id === id)));
                }}>Accepte</button>
            </>
        )} header={(
            <div className="model-picker-modal-header">
                <span>{`Select ${model?.name} (${tableController.count})`}</span>
                <div className="model-picker-modal-search">
                    <input className="app-input" placeholder="Search" type="search" defaultValue={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="model-picker-modal-filters">
                    <div className="model-picker-modal-filter-item">
                        <label>Max Items : </label>
                        <select value={max} onChange={e => setMax(parseInt(e.target.value))} className="app-input">
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={30}>30</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                    <div className="model-picker-modal-filter-item">
                        <label>Sort : </label>
                        <select value={sort} onChange={e => setSort(e.target.value)} className="app-input">
                            <option value="NEWEST">Newest</option>
                            <option value="OLDEST">Oldest</option>
                        </select>
                    </div>
                </div>
                {model?.name === "media" && checkModelPerms(user, "media", 0) && (
                    <button className="app-button primary icon" onClick={() => modals.uploadMedia.open(tableController.refresh)}>
                        <UploadIcon />
                        Upload
                    </button>
                )}
            </div>
        )}>
            <div className="modal-picker-models">
                {model && models?.map(modelData => (
                    <div key={modelData._id} className="model-picker-table-item">
                        <ModelPreview data={modelData} model={model}
                            selectable={[() => isActive(modelData._id), () => switchItem(modelData._id)]} />
                    </div>
                ))}
            </div>
            {!models && loading && <Loader fluid />}
        </Modal>
    )
};