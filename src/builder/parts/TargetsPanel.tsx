import { useMemo, useState } from "react";
import { StringField, StringInput } from "../comps/Fields";
import BuilderModal from "../comps/Modal";
import { Add2Icon, DeviceIcon, DoneIcon, ResetIcon } from "../icons";
import { LayoutActions, PageActions, TargetsActions, useBuilderContext } from "../states";
import { changeURLPageParam, extLocale, changeLink, useInputValidator, validLink } from "../utils";
import { BuilderModals } from "../utils/modals";
import { Loader } from "../../comps";
import { useMainContext } from "../../states";

const discardChangesMessgaeInfo = {
    cancel: "Cancel",
    confirm: "Discard",
    color: "danger",
    message: `You didnt save this draft, do you wants to discard this changes ?`,
    title: "Discarding Chnages",
    type: "danger"
};

const cannotCreateLocaleInfo = {
    confirm: "Ok",
    color: "info",
    message: `You cant create a locale form a model page, please add locale in model page instead.`,
    title: "Creating locale"
}

const TargetsPanel = () => {
    const { controller: { modals } } = useMainContext();
    const { page, layout, targets, wapi } = useBuilderContext();
    const [targetsModal, setTargetsModal] = useState<boolean>(false);
    const [link, setLink] = useState<string>(page.state.link);
    const [selectedLocale, setSelectedLocale] = useState<string>(page.state.locale);
    const [selectedTarget, setSelctedTarget] = useState<string>();
    const [loading, setLoading] = useState<boolean>(false);
    const errors = useInputValidator<string>(link => {
        if(!validLink(link)) return "Please enter a valid link";
    });
    const cantApply = useMemo(() => (link === page.state.link && (page.state.avaibleTargets.includes("locales") || page.state.locale === selectedLocale)), [link, page.state.link, page.state.locale, selectedLocale])

    const changeLocale = () => {
        if(selectedLocale) {
            const res = page.module.changeLocale(selectedLocale);

            if(!res) {
                if(page.module.document.model) layout.set({
                    type: LayoutActions.Modal,
                    modal: BuilderModals.ConfirmModal,
                    info: cannotCreateLocaleInfo,
                    callBack: () => {}
                })
                setSelectedLocale(page.state.locale);
            }
        }
    }
    
    const saveHandler = async () => {
        if(link !== page.state.link) {
            setLoading(true);
            if(page.state.canSave) {
                modals.confirm.open(discardChangesMessgaeInfo).then(async res => {
                    if(res) await changeLink(link, selectedLocale);

                    setLoading(false);
                })
            } else {
                await changeLink(link, selectedLocale);
                setLoading(false);
            }
        } else {
            if(page.state.canSave) {
                layout.set({
                    type: LayoutActions.Modal,
                    modal: BuilderModals.ConfirmModal,
                    info: discardChangesMessgaeInfo,
                    callBack: res => res && changeLocale()
                })
            } else changeLocale();
        }
    };

    const accepteHandler = async () => {
        if(selectedTarget) {
            page.module.addTarget(selectedTarget);
            setTargetsModal(false);
            setSelctedTarget("");
        }
    }

    return (
        <div id="__Builder-Targets" className="__Builder-Right-Panel Builder-Panel">
            <div id="__Builder-Targets-Page-Group" className={`__Builder-Fields-Group label`}>
                <div className="__Builder-Fields-Group __Builder-Field">
                    <div className="__Builder-Fields-Group-Label ">
                        <label>Target Page</label>
                        {page.state.avaibleTargets.length > 0 && <button className="NewButton" onClick={() => setTargetsModal(true)}>
                            <Add2Icon />
                        </button>}
                        {link !== page.state.link && <button onClick={() => setLink(page.state.link)}>
                            <ResetIcon />
                        </button>}
                        <button className="SaveButton" onClick={saveHandler} disabled={loading ||cantApply || Boolean(errors.controller[0])}>
                            {loading ? <Loader size="small" /> :<DoneIcon />}
                        </button>
                    </div>
                    <div className="__Builder-Fields-Group-List">
                        <StringInput args={{ default: "", type: "short" }} label="Link" setValue={link => setLink(link)} value={link} errors={errors} />
                        {!page.state.avaibleTargets.includes("locales") && 
                            <StringInput 
                                args={{ default: wapi.info.defaultLocale, type: "enum", enums: Object.keys(wapi.info.locales) }} 
                                label="Locale" setValue={locale => setSelectedLocale(wapi.info.locales[locale])} value={extLocale(selectedLocale)} 
                            />
                        }
                    </div>
                </div>
            </div>
            <div id="__Builder-Targets-Page-Group" className={`__Builder-Fields-Group label`}>
                <div className="__Builder-Fields-Group __Builder-Field">
                    <div className="__Builder-Fields-Group-Label ">
                        <label>Target Devices</label>
                    </div>
                    <div className="__Builder-Fields-Group-List">
                        {wapi.info.devices.map(device => {
                            const checked = Boolean(targets.devices.find(d => d.name === device.name));
                            
                            return (
                                <div className="__Builder-Targets-Device" key={device.name} onClick={() => targets.set({ type: TargetsActions.ToggleDevice, device })} >
                                    <DeviceIcon device={device} />
                                    <div className="__Builder-Targets-Device-Info">
                                        <div>{device.name}</div>
                                        <div>
                                            <span>{device.range[0]}px</span>{device.range[1] && device.range[1] !== Infinity && <> - <span>{device.range[1]}px</span></>}
                                        </div>
                                    </div>
                                    <input type="checkbox" checked={checked} onChange={() => {}} /> 
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
            
            <BuilderModal id="__Builder-Targets-Modal" controller={[targetsModal, setTargetsModal]} header="Add Page Target" footer={<>
                <button onClick={() => setTargetsModal(false)}>Cancel</button>
                <button disabled={!selectedTarget} onClick={accepteHandler}>Accepte</button>
            </>}>
                <StringInput value={selectedTarget || ""} setValue={val => setSelctedTarget(val)} args={{ type: "enum", enums: page.state.avaibleTargets }} label={"Avaible Targtes"} />
            </BuilderModal>
        </div>
    )
}

export default TargetsPanel;