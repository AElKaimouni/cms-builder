import { useEffect, useState } from "react";
import { Loader, Modal, ModelPreview } from "../../comps";
import { DeleteIcon, UploadIcon, formatBytes, useModal } from "../../utils";
import { MediaAPi } from "../../APIs";
import Dropzone from "react-dropzone";
import MediaCard from "../../builder/comps/MediaCard";
import { FileType, FormFileType, ModelObject, UrlFile } from "../../types";

export const useUploadModal = () => {
    const modalController = useModal();
    const [callBack, setCallBack] = useState<() => void>(() => {});

    return { modalController, callBack, open: (callBack?: () => void) => {
        modalController.open();
        setCallBack(() => callBack);
    }, close: () => {
        modalController.close();
    } };
};

interface Props {
    controller : ReturnType<typeof useUploadModal>;
}

let imgsIdCount = 0;

export default ({ controller } : Props) => {
    const { modalController, callBack  } = controller;
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
            modalController.close();
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
        <Modal id="upload-modal" controller={modalController} header={<>
            Upload Assets
            {error}
        </>} footer={<>
            <button className="app-button" disabled={loading} color="secondary" onClick={() => {
                    if(selectedFiles.length && activeTab !== 1) {
                        setActiveTab(1); setEditImage(null);
                    } else modalController.close();
                }}>
                {(selectedFiles.length === 0 || activeTab === 1) ? "Cancel" : "Back"}
            </button>
            <button className="app-button primary" disabled={loading || (mediaTabCond && !Boolean(urls))} onClick={() => { 
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
                    if(loading) return <Loader button />
                    if(mediaTabCond) return "Add Assets";
                    if(uploadTabCond) return "Upload";
                    if(editTabCond) return "Save";
                })()}
            </button>
        </>}>
            {mediaTabCond && <>
                <div className="Upload-Modal-Menu">
                    <div 
                        className={`${activePanel === "desktop" ? "Active" : "" }`}
                        onClick={() => { setActivePanel("desktop") }}
                    >
                        FROM COMPUTER
                    </div>
                    <div
                        className={`${activePanel === "url" ? "Active" : ""}`}
                        onClick={() => { setActivePanel("url"); }}
                    >
                        FROM URL
                    </div>
                </div>
                <div className="Upload-Modal-Content">
                    {activePanel == "desktop" && <div>
                        <Dropzone onDrop={acceptedFiles => handleAcceptedFiles(acceptedFiles) } >
                            {({ getRootProps, getInputProps }) => (
                                <div className="Upload-Modal-DropZone">
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
                    {activePanel == "url" && <div className="Upload-Modal-Link-Content">
                        <label htmlFor="uplaodURLInput">URL</label>
                        <textarea className="app-input" value={urls} onChange={e => setUrls(e.target.value)} style={{ minHeight: "8em" }} id="uplaodURLInput" placeholder="type a media url"></textarea>
                        <p className="m-2">Separate your URL links by a carriage return.</p>
                    </div>}
                </div>
            </>}
            {uploadTabCond && <>
                <div>
                    <div className="Upload-Modal-Header">
                        <div>{selectedFiles.length} Assets selected</div>
                        <div>
                            <button className="app-button primary" onClick={() => setActiveTab(0)}>Add More Assets</button>
                        </div>
                    </div>

                    <div className="Upload-Modal-List">
                        {selectedFiles.map((media, index) => (
                            <div key={index}>
                                {(() => {
                                    const format = (media as any).format || (media.type ? media.type.split("/")[1] : null) ;
                                    return (
                                        <ModelPreview methods={[
                                            {
                                                callBack: () => {
                                                    setSelectedFiles(files => [...files.slice(0, index), ...files.slice(index + 1)]);
                                                    if(media.urlMedia) setUrlsFiles(urls => urls.filter(file => file.id !== media.id));
                                                    else setLocalFiles(files => files.filter(file => file.id !== media.id));
                                                },
                                                icon: <DeleteIcon />,
                                                color: "danger"
                                            }
                                        ]} className="upload-modal-preview-item" model={{ name: "media" } as ModelObject} data={ { url: media.preview, type: media.type } }>
                                            <p style={{ wordSpacing: "nowrap", margin: 0, textOverflow: "ellipsis", overflow: "hidden" }}>{media.name ? media.name : <br/>}</p>
                                            <p style={{margin: 0}}><span style={{ textTransform: "uppercase" }}>{format}</span> - {(media as any).formattedSize || ((media as any).size ? formatBytes((media as any).size) : "")}</p>
                                        </ModelPreview>
                                    )
                                })()}
                            </div>
                        ))}
                    </div>

                </div>
            </>}
        </Modal>
    )
}