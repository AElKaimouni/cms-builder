import { useEffect } from "react";
import { PageAPi, UsersAPi } from "../../APIs";
import { Breadcrumps, Dropmenu, Layout, Loader, ModelPreview, Panigration } from "../../comps"
import { useMainContext } from "../../states"
import { AddIcon, checkModelPerms, defaultProfileAvatar, getUserRole, useList, useSelect, useTable } from "../../utils"
import { ModelObject, User, UserRole } from "../../types";

export default () => {
    const { user, controller: { router, modals }, status: { locales, defaultLocale } } = useMainContext();
    const userDoc = user;
    const select = useSelect();
    const { count, search, models, refresh, pageController, loading, max, setLoad } = useTable<User>(async (info) => {
        const res =  await UsersAPi.table({
            ...({...info, sort: undefined}),
            query: "name avatar email role created_at"
        });

        return { count: res.count, models: res.users };
    });

    return (
        <Layout>
            <Breadcrumps title="Users" items={[
                {
                    name: "Dashboard",
                    link: "/"
                },
                {
                    name: "users"
                }
            ]} >
                {checkModelPerms(user, "users", 0) && 
                    <button onClick={() => router.navigate(`/users/form`)} className="primary icon app-button">
                        <AddIcon /> Add New User
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
                        {checkModelPerms(user, "users", 3) && <Dropmenu style={{ margin: "0 0 0 10px", background: "#fff" }} actions={[
                            {
                                name: "Delete",
                                callBack: async () => {
                                    const res = await modals.confirm.open({
                                        cancel: "cancel",
                                        confirm: "delete",
                                        message: "Are you sure u wanna delete this users ?",
                                        title: `Deleting Users`,
                                        type: "danger"
                                    })

                                    if(res) {
                                        await UsersAPi.deleteUsers(select.state.map(id => ({
                                            _id: id
                                        })));
                                        refresh();
                                        select.clear();
                                    }
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
                                <th>Avatar</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Join Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {models && models.map(user => (
                                <tr onClick={e => {
                                    if(e.target instanceof HTMLElement && !e.target.closest(".unclickable, button")) {
                                        router.navigate(`/users/form/${user._id}`, { locale: router.searchParams.get("locale") || defaultLocale })
                                    }
                                }} key={user._id}>
                                    <td onClick={() => select.switchItem(user._id)} className="unclickable">
                                        <input  type="checkbox" checked={select.isActive(user._id)} />
                                    </td>
                                    <td>
                                        <ModelPreview table data={user.avatar || defaultProfileAvatar} model={{ name: "media" } as ModelObject} />
                                    </td>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <div style={{ textTransform: "capitalize" }} className={`badge ${(() => {
                                            switch(user.role) {
                                                case UserRole.Super_Admin: return "danger";
                                                case UserRole.Admin: return "info";
                                                case UserRole.User: return "success";
                                                default: return "";
                                            }
                                        })()}`}>{getUserRole(user.role)}</div>
                                    </td>
                                    <td>{new Date(user.created_at).toDateString()}</td>
                                    <td className="unclickable">
                                        <Dropmenu actions={[
                                            {
                                                name: "Edit",
                                                callBack: () => router.navigate(`/users/form/${user._id}`)
                                            },
                                            ...(checkModelPerms(userDoc, "users", 3) ? [
                                                {
                                                    name: "Delete",
                                                    callBack: async () => {
                                                        const res = await modals.confirm.open({
                                                            cancel: "cancel",
                                                            confirm: "delete",
                                                            message: "Are you sure u wanna delete this user ?",
                                                            title: `Deleting ${user.name}`,
                                                            type: "danger"
                                                        })
    
                                                        if(res) {
                                                            await UsersAPi.deleteUsers([{ _id: user._id }]);
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