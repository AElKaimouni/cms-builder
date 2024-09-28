import { FieldObject, ModelObject } from "../types";
import lodash from "lodash";
import { checkModelPerms, useModelTable, useTable } from "../utils";
import Loader from "./Loader";
import { PreviewField } from "./fields";
import Panigration from "./Panigration";
import { useMainContext } from "../states";
import Dropmenu from "./Dropmenu";
import { ModelAPi } from "../APIs";

interface Props {
    model: ModelObject;
}

export default ({ model } : Props) => {
    const { user, controller: { router, modals }, status: { locales, defaultLocale } } = useMainContext();
    const { models, loading, search, pageController, count, max, select, refresh, locale } = useModelTable(model);

    return (
        <div className="app-model-table">
            <div style={{ marginBottom: 0 }} className="page-panel p-0 no-background text-color2">
                <p style={{ margin:0, marginLeft: ".5em" }}>{count} entries found</p>
            </div>
            <div className="app-model-table-tools">
                <div className="app-model-table-tools-left">
                    <div className="form-group app-model-table-search">
                        <input placeholder="Search" className="app-input" type="search" defaultValue={search[0]} onChange={e => search[1](e.target.value)} />
                        <button className="app-button primary">Search</button>
                    </div>
                    {select.state.length ? `(${select.state.length}) Selected Items` : ""}
                </div>
                <div className="app-model-table-tools-right">
                    {model.i18n && <select style={{ marginBottom: 0, minWidth: "120px", textTransform: "capitalize" }}
                        onChange={e => {
                            router.searchParams.set("locale", e.target.value);
                            locale.active(e.target.value);
                        }} 
                        value={locale.state[0] as string} className="app-input"
                    >
                        {locales.map(locale => (
                            <option key={locale.id} value={locale.id}>{locale.name} [{locale.ext}]</option>
                        ))}
                    </select>}
                    {checkModelPerms(user, model.name, 3) && 
                        <Dropmenu style={{ margin: "0 0 0 10px", background: "#fff" }} actions={[
                            {
                                name: "Delete",
                                callBack: async () => {
                                    const res = await modals.confirm.open({
                                        cancel: "cancel",
                                        confirm: "delete",
                                        message: "Are you sure u wanna delete this model ?",
                                        title: `Deleting ${model.name}`,
                                        type: "danger"
                                    })

                                    if(res) {
                                        
                                    }
                                },
                                disabled: select.state.length === 0
                            }
                        ]} />
                    }
                </div>
            </div>
            
            <div style={{ overflow: "unset", marginTop: ".25em" }} className="page-panel p-0">
                <table className="app-table">
                    <thead>
                        <tr>
                            <th onClick={() => select.setState(select.state.length === models?.length ? [] : models?.map(m => m._id) || [])}>
                                <input type="checkbox" checked={select.state.length === models?.length} />
                            </th>
                            {model.preview.table.map(({prop, name}) => (
                                <th key={prop}>{name}</th>
                            ))}
                            <th>State</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {models && models.map(m => (
                            <tr onClick={e => {
                                if(e.target instanceof HTMLElement && !e.target.closest(".unclickable, button")) {
                                    router.navigate(`/models/new/${model.name}/${m._id}`, { locale: router.searchParams.get("locale") || defaultLocale })
                                }
                            }} key={m._id}>
                                <td onClick={() => select.switchItem(m._id)} className="unclickable">
                                    <input  type="checkbox" checked={select.isActive(m._id)} />
                                </td>
                                {model.preview.table.map(({prop}) => (
                                    <td key={prop}>
                                        <PreviewField data={lodash.get(m, prop)} field={lodash.get(model.props, prop) as FieldObject} />
                                    </td>
                                ))}
                                <td>
                                    <div className={`badge ${m.published ? "success" : ""}`}>{m.published ? "Published" : "Draft"}</div>
                                </td>
                                <td className="unclickable">
                                    <Dropmenu actions={[
                                        {
                                            name: "Edit",
                                            callBack: () => router.navigate(`/models/new/${model.name}/${m._id}`)
                                        },
                                        {
                                            name: "Dublicate",
                                            callBack: () => {}
                                        },
                                        ...(checkModelPerms(user, model.name, 3) ? [
                                            {
                                                name: "Delete",
                                                callBack: async () => {
                                                    const res = await modals.confirm.open({
                                                        cancel: "cancel",
                                                        confirm: "delete",
                                                        message: "Are you sure u wanna delete this model ?",
                                                        title: `Deleting ${model.name}`,
                                                        type: "danger"
                                                    })
    
                                                    if(res) {
                                                        await ModelAPi.delete({ name: model.name, id: m._id, locale: model.i18n? locale.state[0] || undefined : undefined });
                                                        refresh();
                                                    }
                                                }
                                            }
                                        ] : [])
                                    ]} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {loading && <Loader fluid />}
            </div>
            <div className="app-table-bot-tools page-panel p-0 no-background">
                <div className="app-table-bot-tools-left">
                    <select className="app-input" value={max[0]} onChange={e => max[1](parseInt(e.target.value))}>
                        {[10, 20, 30, 50, 100].map(item => (
                            <option value={item} key={item}>{item}</option>
                        ))}
                    </select>
                    <label className="text-color2">Entries per page</label>
                </div>
                <div className="app-table-bot-tools-right">
                    <Panigration controller={pageController} count={Math.ceil((count || 0) / (max[0] || 1))} />
                </div>
            </div>
        </div>
    )
}