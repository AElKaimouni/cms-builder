import { MediaAPi } from "../APIs";
import { Breadcrumps, Layout, Loader, ModelPreview, Panigration } from "../comps"
import { useMainContext } from "../states";
import { ModelObject } from "../types";
import { DeleteIcon, UploadIcon, checkModelPerms, useModelTable } from "../utils";

const mediaModel = { name: "media" } as ModelObject;
export default () => {
    const { user, controller: { modals } } = useMainContext();
    const { count, loading, models, select, search, refresh, pageController, max } = useModelTable(mediaModel, "public_id _id", 24);

    return (
        <Layout>
            <Breadcrumps title="Media" items={[
                {
                    name: "Dashboard",
                    link: "/"
                },
                {
                    name: "domains"
                }
            ]} >
                {checkModelPerms(user, "media", 0) && 
                    <button onClick={() => modals.uploadMedia.open(refresh)} className="primary icon app-button">
                        <UploadIcon /> Upload Media
                    </button>
                }
            </Breadcrumps>
            <div style={{ marginBottom: 0 }} className="page-panel p-0 no-background text-color2">
                <p style={{ margin:0, marginLeft: ".5em" }}>{count} entries found</p>
            </div>
            <div className="app-model-table-tools">
                <div className="app-model-table-tools-left">
                    <div className="form-group app-model-table-search">
                        <input placeholder="Search" className="app-input" type="search" defaultValue={search[0]} onChange={e => search[1](e.target.value)} />
                        <button className="app-button primary">Search</button>
                    </div>
                    <label className="text-color2">Entries per page</label>
                    <select className="app-input" value={max[0]} onChange={e => max[1](parseInt(e.target.value))}>
                        {[12, 24, 48, 96, 192].map(item => (
                            <option value={item} key={item}>{item}</option>
                        ))}
                    </select>
                    {select.state.length ? `(${select.state.length}) Selected Items` : ""}
                </div>
                <div style={{ alignItems: "center" }} className="app-model-table-tools-right">
                    
                    <Panigration controller={pageController} count={Math.ceil((count || 0) / (max[0] || 1))} />
                    {checkModelPerms(user, "media", 3) && 
                        <button style={{ fontSize: "1.25em" }} onClick={async () => {
                            const res = await modals.confirm.open({
                                cancel: "cancel",
                                confirm: "delete",
                                message: "Are you sure u wanna delete selected media ?",
                                title: "Deleting Media",
                                type: "danger"
                            });

                            if(res) {
                                await MediaAPi.delete(select.state);
                                refresh();
                            }
                        }} disabled={select.state.length === 0} className="app-button icon danger">
                            <DeleteIcon />
                        </button>
                    }
                </div>
            </div>
            <div className="page-panel">
                <div className="media-list">
                    {loading && !models && <Loader fluid />}
                    {models && models.map((data, index) => (
                        <ModelPreview
                            selectable={[() => select.state.includes(data._id), () => select.switchItem(data._id)]}
                            key={data._id} model={mediaModel} data={data}/>
                    ))}
                </div>
            </div>
        </Layout>
    )
}