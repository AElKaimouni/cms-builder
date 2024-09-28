import { useEffect } from "react";
import { PageAPi } from "../../APIs";
import { Breadcrumps, Dropmenu, Layout, Loader, Panigration } from "../../comps"
import { useMainContext } from "../../states"
import { AddIcon, checkModelPerms, useList, useSelect, useTable } from "../../utils"

export default () => {
    const { user, controller: { router, modals }, status: { locales, defaultLocale } } = useMainContext();
    const locale = useList(router.searchParams.get("locale") || defaultLocale);
    const select = useSelect();
    const loadFunction =  () => async (info) => {
        const res = await PageAPi.table({
            max: info.max, skip: info.page * info.max, search: info.search,
            ...(locale.state[0] ? {
                locale: locale.state[0]
            }: {}),
            noModel: true
        });

        return { count: res.count, models: res.pages };
    };
    const { count, search, models, refresh, pageController, loading, max, setLoad } = useTable(loadFunction());

    useEffect(() => { setLoad(loadFunction) }, [locale.state[0]])

    return (
        <Layout>
            <Breadcrumps title="Pages" items={[
                {
                    name: "Dashboard",
                    link: "/"
                },
                {
                    name: "domains"
                }
            ]} >
                {checkModelPerms(user, "pages", 0) &&
                    <button onClick={() => router.navigate(`/pages/form`)} className="primary icon app-button">
                        <AddIcon /> Add New Page
                    </button>
                }
            </Breadcrumps>
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
                        <select style={{ marginBottom: 0, minWidth: "120px", textTransform: "capitalize" }}
                            onChange={e => {
                                router.searchParams.set("locale", e.target.value);
                                locale.active(e.target.value);
                            }} 
                            value={locale.state[0] as string} className="app-input"
                        >
                            {locales.map(locale => (
                                <option key={locale.id} value={locale.id}>{locale.name} [{locale.ext}]</option>
                            ))}
                        </select>
                        {checkModelPerms(user, "pages", 3) && <Dropmenu style={{ margin: "0 0 0 10px", background: "#fff" }} actions={[
                            {
                                name: "Delete",
                                callBack: async () => {
                                    const res = await modals.confirm.open({
                                        cancel: "cancel",
                                        confirm: "delete",
                                        message: "Are you sure u wanna delete this model ?",
                                        title: `Deleting Page`,
                                        type: "danger"
                                    })

                                    if(res) {}
                                },
                                disabled: select.state.length === 0
                            }
                        ]} />}
                    </div>
                </div>
                
                <div style={{ overflow: "unset", marginTop: ".25em" }} className="page-panel p-0">
                    <table className="app-table">
                        <thead>
                            <tr>
                                <th onClick={() => select.setState(select.state.length === models?.length ? [] : models?.map(page => page._id) || [])}>
                                    <input type="checkbox" checked={select.state.length === models?.length} />
                                </th>
                                <th>Name</th>
                                <th>URL</th>
                                <th>Locales</th>
                                <th>State</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {models && models.map(page => (
                                <tr onClick={e => {
                                    if(e.target instanceof HTMLElement && !e.target.closest(".unclickable, button")) {
                                        router.navigate(`/pages/form/${page._id}`, { locale: router.searchParams.get("locale") || defaultLocale })
                                    }
                                }} key={page._id}>
                                    <td onClick={() => select.switchItem(page._id)} className="unclickable">
                                        <input  type="checkbox" checked={select.isActive(page._id)} />
                                    </td>
                                    <td>{page.name}</td>
                                    <td>
                                        {page.link}
                                    </td>
                                    <td>
                                        {page.locales.map(l => l.locale).join(", ").toUpperCase()}
                                    </td>
                                    <td>
                                        <div className={`badge ${page.published ? "success" : ""}`}>{page.published ? "Published" : "Draft"}</div>
                                    </td>
                                    <td className="unclickable">
                                        <Dropmenu actions={[
                                            {
                                                name: "Edit",
                                                callBack: () => router.navigate(`/pages/form/${page._id}`)
                                            },
                                            {
                                                name: "Dublicate",
                                                callBack: () => {}
                                            },
                                            ...(checkModelPerms(user, "pages", 3) ? [
                                                {
                                                    name: "Delete",
                                                    callBack: async () => {
                                                        const res = await modals.confirm.open({
                                                            cancel: "cancel",
                                                            confirm: "delete",
                                                            message: "Are you sure u wanna delete this model ?",
                                                            title: `Deleting ${page.name} Page`,
                                                            type: "danger"
                                                        })
    
                                                        if(res) {
                                                            await PageAPi.delete({ _id: page._id });
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
                    {!models && loading && <Loader />}
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
        </Layout>
    )
}