import { Dispatch, useEffect, useState } from "react";
import CompCard from "../comps/CompCard";
import { StringField, StringInput } from "../comps/Fields";
import BuilderModal from "../comps/Modal"
import { LayoutActions, useBuilderContext } from "../states"
import { BuilderMedia, ConfirmModalInfo, FileType, FormFileType, ModelFieldArgs, UrlFile } from "../types";
import Dropzone from "react-dropzone";
import { formatBytes, storeModel } from "./fonctions";
import MediaAPi from "../../APIs/MediaAPi";
import BuilderLoading from "../comps/Loading";
import { UploadIcon } from "../icons";
import MediaCard from "../comps/MediaCard";
import { readRef } from "./references";
import Panigrations from "../comps/Panigration";


export enum BuilderModals {
    ConfirmModal,
    CompsModal,
    CreateSymbol,
    UploadModal,
    MediaModal
}

export interface BuilderConfirmModalAction {
    type: LayoutActions.Modal,
    modal: BuilderModals.ConfirmModal,
    info: ConfirmModalInfo | null,
    callBack?: (res: boolean) => void
};

export interface BuilderCompsModalAction {
    type: LayoutActions.Modal,
    modal: BuilderModals.CompsModal,
    comps: string[] | null;
    callBack?: (res: string) => void;
}

export interface BuilderCSymbolModalAction {
    type: LayoutActions.Modal;
    modal: BuilderModals.CreateSymbol;
    opened: boolean;
    callBack?: (res: string, close: () => void) => void;
};

export interface BuilderUploadModalAction {
    type: LayoutActions.Modal;
    modal: BuilderModals.UploadModal;
    opened: boolean;
    callBack?: () => void;
}

export interface BuilderMediaModalAction {
    type: LayoutActions.Modal;
    modal: BuilderModals.MediaModal;
    count: number;
    args: ModelFieldArgs;
    callBack?: (res: BuilderMedia[]) => void
}

export type BuilderModalAction =
    BuilderConfirmModalAction |
    BuilderCompsModalAction |
    BuilderCSymbolModalAction | 
    BuilderUploadModalAction |
    BuilderMediaModalAction
;

export const CreateSymboldModal = {
    type: BuilderModals.CreateSymbol,
    Modal: ({ opened }) => {
        const [name, setName] = useState<string>("");
        const { layout } = useBuilderContext();
        const modalController: [Boolean, Function] = [
            opened,
            () => layout.set({ type: LayoutActions.Modal, modal: BuilderModals.CreateSymbol, opened: false })
        ];
    
        return (
            <BuilderModal controller={modalController} footer={<>
                <button id="__BuilderCSymbolModalCancelBtn">Cancel</button>
                <button id="__BuilderCSymbolModalConfirmBtn">Create</button>
            </>} header={"Create new Symbol"} >
                <StringInput
                    id={"__BuilderCSymbolModalField"}
                    args={{ type: "short" }} 
                    label="Symbol Name" 
                    setValue={name => setName(name)}
                    value={name}
                />
            </BuilderModal>
        )
    },
    setter: (action: BuilderCSymbolModalAction, setOpen: Dispatch<boolean>) => {
        setOpen(action.opened);
        if(action.opened) {
            const confrimBtn = document.getElementById("__BuilderCSymbolModalConfirmBtn");
            const cancelBtn = document.getElementById("__BuilderCSymbolModalCancelBtn");
            const field = document.getElementById("__BuilderCSymbolModalField") as HTMLInputElement;
            const confirmListener = () => {
                
                confrimBtn?.removeEventListener("click", confirmListener);
                cancelBtn?.removeEventListener("click", cancelListener);
                
                confrimBtn?.setAttribute("disabled", "true");
                cancelBtn?.setAttribute("disabled", "true");
                
                action.callBack?.(field?.value || "", () => {
                    setOpen(false);
                    confrimBtn?.removeAttribute("disabled");
                    cancelBtn?.removeAttribute("disabled");
                });
            };
            const cancelListener = () => {
                setOpen(false)
                cancelBtn?.removeEventListener("click", cancelListener);
                confrimBtn?.removeEventListener("click", confirmListener);
            };

            confrimBtn?.addEventListener("click", confirmListener);
            cancelBtn?.addEventListener("click", cancelListener);
        }
    }
}

export const ConfirmModal =     {
    type: BuilderModals.ConfirmModal,
    Modal: ({ info } : { info: ConfirmModalInfo | null }) => {
        const { layout } = useBuilderContext();
        const modalController: [Boolean, Function] = [
            Boolean(info),
            () => layout.set({ type: LayoutActions.Modal, modal: BuilderModals.ConfirmModal, info: null })
        ];
    
        return (
            <BuilderModal id="__Builder-Confirm-Modal" controller={modalController} footer={<>
                <button style={{ opacity: info?.cancel ? 1 : 0 }} id="__BuilderConfirmModalCancelBtn">{info?.cancel}</button>
                <button style={{ opacity: info?.confirm ? 1 : 0 }} id="__BuilderConfirmModalConfirmBtn">{info?.confirm}</button>
            </>} header={info?.title} >
                {info?.message}
            </BuilderModal>
        )
    },
    setter: (action: BuilderConfirmModalAction, setInfo: Dispatch<BuilderConfirmModalAction["info"]>) => {
        setInfo(action.info);
        if(action.info) {
            const confrimBtn = document.getElementById("__BuilderConfirmModalConfirmBtn");
            const cancelBtn = document.getElementById("__BuilderConfirmModalCancelBtn");

            const confirmListener = () => {
                setInfo(null);
                confrimBtn?.removeEventListener("click", confirmListener);
                cancelBtn?.removeEventListener("click", cancelListener);
                action.callBack?.(true);
            };
            const cancelListener = () => {
                setInfo(null)
                cancelBtn?.removeEventListener("click", cancelListener);
                confrimBtn?.removeEventListener("click", confirmListener);
                action.callBack?.(false);
            };

            confrimBtn?.addEventListener("click", confirmListener);
            cancelBtn?.addEventListener("click", cancelListener);
        }
    }
};

export const CompsModal =     {
    type: BuilderModals.CompsModal,
    Modal: ({ comps }: { comps: string[] | null }) => {
        const { layout, wapi } = useBuilderContext();
        const modalController: [Boolean, Function] = [
            Boolean(comps),
            () => layout.set({ type: LayoutActions.Modal, modal: BuilderModals.CompsModal, comps: null })
        ];
        return (
            <BuilderModal controller={modalController} footer={<></>} header="Select A Compoenent" >
                <div id="__BuilderCompsModal">
                    {comps && comps.map(compName => {
                        return <div className="__Builder-CompsModalItem" style={{ width: 200 }}>
                            <CompCard key={compName} name={compName} clickable /> 
                        </div>
                    })}
                </div>
            </BuilderModal>
        )
    },
    setter: (action: BuilderCompsModalAction, setComps: Dispatch<BuilderCompsModalAction["comps"]>) => {
        const comps = action.comps;
        setComps(comps);
        if(comps) {
            const parent = document.getElementById("__BuilderCompsModal");
            if(parent instanceof HTMLElement) {
                const listener = e => {
                    const target = e.target;
                    if(target instanceof HTMLElement) {
                        const etarget = target.closest(".__Builder-CompsModalItem");
    
                        if(etarget) {
                            setComps(null);
                            action.callBack?.(comps[[...parent.children].indexOf(etarget)]);
                            parent.removeEventListener("click", listener);
                        }
                    }
                };
                
                parent.addEventListener("click", listener);
            }
        }
    }
}

interface UploadModalProps {
    opened: boolean;
    callBack?: () => void
}

let imgsIdCount = 0;

export const UploadModal = {
    type: BuilderModals.UploadModal,
    Modal: ({ opened, callBack } : UploadModalProps) => {
        const { layout } = useBuilderContext();
        const modalController: [Boolean, Function] = [
            opened,
            (val: boolean) => layout.set({ type: LayoutActions.Modal, modal: BuilderModals.UploadModal, opened: val, callBack })
        ];
        const [localFiles, setLocalFiles] = useState<FileType[]>([]);
        const [urlsFiles, setUrlsFiles] = useState<UrlFile[]>([])
        const [selectedFiles, setSelectedFiles] = useState<FormFileType[]>([]);
        const [activePanel, setActivePanel] = useState<string>("desktop");
        const [activeTab, setActiveTab] = useState<number>(0);
        const [urls, setUrls] = useState<string>("");
        const [editImage, setEditImage] = useState<number | null>(null);
        const [editImageName, setEditImageName] = useState<string>("");
        const [loading, setLoading] = useState<boolean>(false);
        const [error, setError] = useState<string>("");
        const mediaTabCond = (selectedFiles.length === 0) || activeTab === 0;
        const uploadTabCond = !mediaTabCond && activeTab === 1;
        const editTabCond = (editImage !== null)  && activeTab === 2;
    
        const handleAcceptedFiles = (files: File[]) => {
            files.map(file =>{
                Object.assign(file, {
                    preview: URL.createObjectURL(file),
                    formattedSize: formatBytes(file.size),
                    id: imgsIdCount++
                })
            });
            setLocalFiles(files as FileType[]);
            setSelectedFiles(f => f.concat(files.map(file => ({
                preview: URL.createObjectURL(file),
                formattedSize: formatBytes(file.size),
                name: file.name,
                type: file.type,
                id: (file as any).id
            }))));
            imgsIdCount++;
        };
        const submitForm = async () => {
            setLoading(true);
            const res = await MediaAPi.upload(localFiles, urlsFiles); setLoading(false);
            
            if(res.status) {
                modalController[1](false);
                setLocalFiles([]);
                setSelectedFiles([]);
                setUrlsFiles([]);
                callBack?.();
            } else if(res.error) setError(res.error);
        };
    
        const addInputAssets = () => {
            const ids = urls.split("\n").map(item => {
                return imgsIdCount++;
            });
    
            setSelectedFiles(f => f.concat(urls.split("\n").map((item, index) => ({
                preview: item,
                type: "image/",
                name: "",
                formattedSize: "",
                id: ids[index],
                urlMedia: true 
            }))));
            setUrlsFiles(urlsFiles.concat(urls.split("\n").map((item, index) => ({
                name: "",
                url: item,
                id: ids[index]
            }))));
            setUrls("");
        };
    
        useEffect(() => {
            if(editImage === null) setActiveTab(1)}
            , [selectedFiles]);
    
        return (
            <BuilderModal className="__Builder-Upload-Modal" controller={modalController} header={<>
                Upload Assets
                {Boolean(error) && error}
            </>} footer={<>
                <button disabled={loading} color="secondary" onClick={() => {
                        if(selectedFiles.length && activeTab !== 1) {
                            setActiveTab(1); setEditImage(null);
                        } else modalController[1](false);
                    }}>
                    {(selectedFiles.length === 0 || activeTab === 1) ? "Cancel" : "Back"}
                </button>
                <button disabled={loading || (mediaTabCond && !Boolean(urls))} color="primary" onClick={() => { 
                    if(mediaTabCond) {
                        addInputAssets(); setActivePanel("desktop"); setActiveTab(1);
                    } else if (editTabCond) {
                        if(typeof editImage === "number") { // edit the image the media uploader
                            const targetFile = selectedFiles[editImage];
                            setSelectedFiles(files => files.map((file, index) => {
                                if(index === editImage) file.name = editImageName;
                                return file;
                            }));
                            if(targetFile.urlMedia) setUrlsFiles(files => files.map(file => {
                                if(file.id === targetFile.id) return {...file, name: editImageName}
                                else return file
                            }));
                            else setLocalFiles(files => files.map(file => {
                                if(file.id === targetFile.id) {
                                    return (new File([file], editImageName, {type: file.type}) as FileType)
                                } else return file;
                            }))
                            setActiveTab(1);
                            setEditImage(null);
                        }
                    } else if (uploadTabCond) submitForm();
                }}>
                    {(() => {
                        if(loading) return <BuilderLoading button />
                        if(mediaTabCond) return "Add Assets";
                        if(uploadTabCond) return "Upload";
                        if(editTabCond) return "Save";
                    })()}
                </button>
            </>}>
                {mediaTabCond && <>
                    <div className="__Builder-Upload-Modal-Menu">
                        <div 
                            className={`${activePanel === "desktop" ? "__Builder-Active" : "" }`}
                            onClick={() => { setActivePanel("desktop") }}
                        >
                            FROM COMPUTER
                        </div>
                        <div
                            className={`${activePanel === "url" ? "__Builder-Active" : ""}`}
                            onClick={() => { setActivePanel("url"); }}
                        >
                            FROM URL
                        </div>
                    </div>
                    <div className="__Builder-Upload-Modal-Content">
                        {activePanel == "desktop" && <div>
                            <Dropzone onDrop={acceptedFiles => handleAcceptedFiles(acceptedFiles) } >
                                {({ getRootProps, getInputProps }) => (
                                    <div className="__Builder-Upload-Modal-DropZone">
                                        <div
                                        className=""
                                            {...getRootProps()}
                                        >
                                        <input {...getInputProps()} />
                                        <div>
                                            <UploadIcon />
                                        </div>
                                        <h4>Drop files here or click to upload.</h4>
                                        </div>
                                    </div>
                                )}
                            </Dropzone>
                        </div>}
                        {activePanel == "url" && <div className="__Builder-Upload-Modal-Link-Content">
                            <label htmlFor="uplaodURLInput">URL</label>
                            <textarea value={urls} onChange={e => setUrls(e.target.value)} style={{ minHeight: "8em" }} id="uplaodURLInput" placeholder="type a media url"></textarea>
                            <p className="m-2">Separate your URL links by a carriage return.</p>
                        </div>}
                    </div>
                </>}
                {uploadTabCond && <>
                    <div>
                        <div className="__Builder-Upload-Modal-Header">
                            <div>{selectedFiles.length} Assets selected</div>
                            <div>
                                <button onClick={() => setActiveTab(0)}>Add More Assets</button>
                            </div>
                        </div>

                        <div className="__Builder-Upload-Modal-List">
                            {selectedFiles.map((media, index) => (
                                <div key={index}>
                                    {(() => {
                                        const format = (media as any).format || (media.type ? media.type.split("/")[1] : null) ;
                                        return (
                                            <MediaCard info={false} media={media} onDelete={() => {
                                                setSelectedFiles(files => [...files.slice(0, index), ...files.slice(index + 1)]);
                                                if(media.urlMedia) setUrlsFiles(urls => urls.filter(file => file.id !== media.id));
                                                else setLocalFiles(files => files.filter(file => file.id !== media.id));
                                            }} onEdit={() => {setEditImage(index); setActiveTab(2); setEditImageName(media.name)}} >
                                                <p style={{ wordSpacing: "nowrap", margin: 0 }}>{media.name ? media.name.split("").map((l, i) => i > 20 ? "" : l).join("") : <br/>}{media.name.length > 20 ? "..." : ""}</p>
                                                <p style={{margin: 0}}><span style={{ textTransform: "uppercase" }}>{format}</span> - {(media as any).formattedSize || ((media as any).size ? formatBytes((media as any).size) : "")}</p>
                                            </MediaCard>
                                        )
                                    })()}
                                </div>
                            ))}
                        </div>

                    </div>
                </>}
                {/* {editTabCond && <>
                    <EditMedia media={selectedFiles[editImage]} onChangeName={name => setEditImageName(name)} />
                </>} */}
            </BuilderModal>
        )
    },
    setter: (action: BuilderUploadModalAction, setOpen: Dispatch<boolean>, setCallBack: Dispatch<() => void>) => {
        setOpen(action.opened);
        setCallBack(() => (() => {
            action.callBack?.();
            setOpen(false);
        }));
    }
}

export const MediaModal = {
    type: BuilderModals.MediaModal,
    Modal: ({ count, args, callBack }: { count: number, args: ModelFieldArgs, callBack?: BuilderMediaModalAction["callBack"] }) => {
        const { layout } = useBuilderContext();
        const modalController: [Boolean, Function] = [
            count > 0,
            () => layout.set({ type: LayoutActions.Modal, modal: BuilderModals.MediaModal, count: 0, args })
        ];
        const [media, setMedia] = useState<BuilderMedia[]>();
        const [mediaCount, setMediaCount] = useState<number>();
        const [page, setPage] = useState<number>(0);
        const [pageItems, setPageItems] = useState<number>(20);
        const [sort, setSort] = useState<number>(1);
        const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
        const maxSelectedItems = count;
        const [loading, setLoading] = useState<boolean>(true);
        const load = () => {
            setLoading(true);
            MediaAPi.get(page, "url width height name id", pageItems, sort).then(res => {
                setMedia(res.media);
                setMediaCount(res.count);
                setLoading(false);
            });
        }
    
        
    
        useEffect(() => { setPage(0) }, [pageItems])
    
        useEffect(() => {
            load();
        }, [page, pageItems, sort]);
    
        useEffect(() => {
            if(selectedMedia.length > maxSelectedItems) setSelectedMedia(selectedMedia.slice(selectedMedia.length - maxSelectedItems))
        }, [selectedMedia])
    
        const handleAccepte = () => {
            selectedMedia.forEach(mediaID => {
                const targetMedia = media?.find(m => m.id === mediaID);
                const __ref = `Model_media_${args.query || ""}_${targetMedia?.id}`;
    
                storeModel(targetMedia, __ref);
            });
    
            if(maxSelectedItems === 1) {
                const targetMedia = media?.find(media => media.id === selectedMedia[0])
                const ref = `Model_media_${args.query || ""}_${targetMedia?.id}`;
    
                callBack?.([readRef<BuilderMedia>(ref)]);
            } else {
                const medias = selectedMedia.map(id => {
                    const targetMedia = media?.find(m => m.id === id);
                    const ref = `Model_media_${args.query || ""}_${targetMedia?.id}`;
                    
                    return readRef<BuilderMedia>(ref);
                });
    
                callBack?.(medias);
            }
    
            modalController[1]();
        }

        return (
            <BuilderModal className="__Builder-Model-Media-Modal" header={<>
                <div className="__Builder-Model-Media-Modal-Header">
                    <h5>Select Media</h5>
                    <div className="__Builder-Model-Media-Modal-Header-Info">
                        <select value={sort} onChange={e => setSort(parseInt(e.target.value))}>
                            <option disabled>Order</option>
                            <option value={0}>Newest</option>
                            <option value={1}>Oldest</option>
                        </select>
                    </div>
                    <button onClick={() => layout.set({ type: LayoutActions.Modal, modal: BuilderModals.UploadModal, opened: true, callBack: () => {
                        load();
                    } })}>
                        Upload Media
                    </button>
                </div>
            </>} footer={<>
                <div className="__Builder-Model-Media-Modal-Footer">
                    <select value={pageItems} onChange={e => setPageItems(parseInt(e.target.value))}>
                        <option disabled>Items</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                    {typeof mediaCount === "number" && <div className="__Builder-Model-Media-Modal-Footer-Info">
                        <Panigrations pageController={[page, setPage]} pagesCount={Math.ceil(mediaCount / pageItems)} />
                    </div>}
                    <button onClick={() => modalController[1]()}>
                        Cancel
                    </button>
                    <button onClick={handleAccepte} disabled={selectedMedia.length === 0}>
                        Accepte
                    </button>
                </div>
            </>} controller={modalController} >
                {mediaCount === 0 && <> There is no media to show. </>}
                {!loading && media && <>
                    <div className="__Builder-Model-Media-List">
                        {media.map((media) => {
                            const checked = selectedMedia.includes(media.id);

                            return (
                                <MediaCard key={media.id}
                                    selected={checked}
                                    media={media}
                                    onDelete={() => {
                                        setLoading(true);
                                        MediaAPi.delete([media.id]).then(() => {
                                            load();
                                        })
                                    }}
                                    onSelect={() => setSelectedMedia(checked ? selectedMedia.filter(id => id !== media.id) : selectedMedia.concat([media.id]))}
                                />
                            )
                        })}
                    </div>
                </>}
                {loading && <BuilderLoading fluid />}
            </BuilderModal>
        )
    },
    setter: (action: BuilderMediaModalAction, setArgs: Dispatch<ModelFieldArgs>, setCount: Dispatch<number>, setCallBack: Dispatch<BuilderMediaModalAction["callBack"]>) => {
        setArgs(action.args);
        setCount(action.count);
        setCallBack(() => (res => {
            action.callBack?.(res);
            setCount(0);
        }));
    }
}