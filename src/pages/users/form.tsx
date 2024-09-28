import { useEffect, useMemo, useRef, useState } from "react";
import { Breadcrumps, Field, Layout, Loader, Media as MediaComp } from "../../comps"
import { useMainContext } from "../../states"
import { FieldTypes, User, UserRole } from "../../types";
import { checkModelPerms, defaultProfileAvatar, getModelByName, getUserRole, useDataLoader, useLoader } from "../../utils";
import StringField from "../../comps/fields/StringField";
import lodash from "lodash";
import { Media } from "../../types/media";
import { checkFields, emailValidator, passwordValidator, usernameValidator } from "../../utils/validators";
import { UserActions } from "../../states/reducers/user";
import { UsersAPi } from "../../APIs";
import { useParams } from "react-router-dom";
import moment from "moment";

const placeholderUser : Omit<User, "verified_at" | "created_at" | "_id"> = {
    email: "",
    first_name: "",
    last_name: "",
    name: "",
    password: "",
    perms: { models: {} },
    role: UserRole.User,
}

export default () => {
    const { user, controller, reducers, layout } = useMainContext();
    const [ userID, setUserID ] = useState<string | undefined>(useParams().id as string);
    const [ userDocument, setUserDocument ] = useState<User>();
    const [ saveLoading, saveLoader ] = useLoader();
    const [ deleteLoading, deleteLoader ] = useLoader();
    const [ editedUser, setEditedUser, initUser, load ] = useDataLoader(async () => {
        if(userID) {
            const res = await UsersAPi.getUser({ _id: userID });
            setUserDocument(res);
            return res;
        }

        return placeholderUser;
    }, saveLoader, [], placeholderUser)
    const [ cPassword, setCPassword ] = useState<string>();
    const changed = useMemo(() => {
        return !lodash.isEqual(
            [initUser],
            [editedUser]
        )
    }, [editedUser, initUser]);
    const ref = useRef<HTMLElement>();

    const deleteUser = async  () => {
        const res = await controller.modals.confirm.open({
            cancel: "Cancel",
            confirm: "Delete",
            message: "Are you sure to delete this user ?",
            title: "Deleting User",
            type: "danger"
        });

        if(res) deleteLoader.process(async () => {
            await UsersAPi.deleteUsers([{ _id: userID }]);

            controller.router.navigate("/users");
        })
    }

    const save = () => {
        if(ref.current && checkFields(ref.current)) {
            const info = {
                first_name: editedUser.first_name,
                last_name: editedUser.last_name,
                name: editedUser.name,
                email: editedUser.email,
                password: editedUser.password,
                role: editedUser.role,
                ...(user?.role as number < UserRole.Admin ? {
                    perms: editedUser.perms,
                } : {}),
                ...(editedUser.avatar ? {
                    avatar: editedUser.avatar._id
                } : {}),
            };

            saveLoader.process(async () => {
                if(userID) {
                    await UsersAPi.updateUser({
                        data: info,
                        user: { _id: userID }
                    });

                    load(editedUser);
                } else {
                    const res = await UsersAPi.createUser(info);
                    load(editedUser);
                    setUserID(res._id);
                    setUserDocument(res);
                }
            });
        }
    }

    return (
        <Layout>
            <Breadcrumps title={userID ? userDocument?.name as string : "Create New User"} items={[
                {
                    name: "Dashboard",
                    link: "/"
                },
                {
                    name: "Users",
                    link: "/users"
                },
                {
                    name: "New"
                }
            ]} >
                {userID && checkModelPerms(user, "users", 3) &&
                    <button onClick={deleteUser} disabled={deleteLoading} className="app-button danger">
                        {deleteLoading ? <Loader button /> : "Delete"}
                    </button>
                }
                {checkModelPerms(user, "users", 2) && 
                    <button onClick={save} disabled={!changed || saveLoading} className="app-button primary">
                        {saveLoading ? <Loader button /> : userID ? "Save" :"Create New User"}
                    </button>
                }
            </Breadcrumps>
            <div className="profile-cnt user-form">
                <div>
                    <div ref={ref as any} className="page-panel fields-panel info-panel">
                        <h2>General Informations</h2>
                        <Field methods={[]} label="" controller={[ placeholderUser, editedUser, setEditedUser ]} props={{
                            first_name: {
                                __type: FieldTypes.String,
                                __args: {
                                    type: "short"
                                }
                            },
                            last_name: {
                                __type: FieldTypes.String,
                                __args: {
                                    type: "short"
                                }
                            },
                            name: {
                                __type: FieldTypes.String,
                                __args: {
                                    type: "short",
                                    validate: {
                                        custom: val => usernameValidator(val),
                                    }
                                }
                            },
                            email: {
                                __type: FieldTypes.String,
                                __args: {
                                    type: "short",
                                    validate: {
                                        custom: val => emailValidator(val)
                                    }
                                }
                            }
                        }} />
                        <h2>Password</h2>
                        <StringField methods={[]} label="Password" controller={["", editedUser.password, password => setEditedUser(u => ({...u, password }))]} field={{
                            __type: FieldTypes.String,
                            __args: {
                                type: "password",
                                validate: {
                                    custom: val => val ? passwordValidator(val) : ""
                                }
                            }
                        }} />
                        <StringField methods={[]} label="Confirm Password" controller={["", cPassword, setCPassword]} field={{
                            __type: FieldTypes.String,
                            __args: {
                                type: "password",
                                validate: {
                                    custom: pass => {
                                        if(editedUser.password && pass !== editedUser.password) return "Passwords are not equal.";
        
                                        return undefined;
                                    }
                                } 
                            }
                        }} />
                        { user && user.role < UserRole.Admin && <>
                            <h2>Permissions</h2>
                            <table align="center" className="user-from-perms-table">
                                <thead>
                                    <tr>
                                        <th>Model</th>
                                        <th>Create</th>
                                        <th>Read</th>
                                        <th>Update</th>
                                        <th>Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {layout.models.map(m => m.name).concat(["pages", "media", "users",]).map((model, index) => {
                                        const modelPerms = editedUser.perms.models?.[model];
                                        const modelObject = layout.models[index];
                                        const onChange = (index: number) => setEditedUser(user => {
                                            const u = lodash.cloneDeep(user);

                                            u.perms.models[model] ||= [false, false, false, false];
                                            u.perms.models[model][index] = !u.perms.models[model][index];
                                            
                                            if(index !== 1 && u.perms.models[model][index])
                                                u.perms.models[model][1] = true;

                                            if(modelObject && modelObject.pages && u.perms.models[model][index]) {
                                                u.perms.models["pages"] ||= [false, false, false, false];
                                                u.perms.models["pages"][index] = true;
                                                if(index !== 1) u.perms.models["pages"][1] = true;
                                            }

                                            return u;
                                        });
                                        const disabled = (index: number) => model === "pages" && Boolean(layout.models.find(m => m.pages && editedUser.perms.models?.[m.name]?.[index]))
                                        return (
                                            <tr key={model} className={model === "pages" ? "line-row" : ""}>
                                                <td>{model}</td>
                                                <td><input disabled={disabled(0)} type="checkbox" checked={modelPerms?.[0]} onClick={() => onChange(0)} /></td>
                                                <td><input disabled={disabled(1) || modelPerms?.[0] || modelPerms?.[2] || modelPerms?.[3]} type="checkbox" checked={modelPerms?.[1]} onClick={() => onChange(1)} /></td>
                                                <td><input disabled={disabled(2)} type="checkbox" checked={modelPerms?.[2]} onClick={() => onChange(2)} /></td>
                                                <td><input disabled={disabled(3)} type="checkbox" checked={modelPerms?.[3]} onClick={() => onChange(3)} /></td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </>}
                    </div>
                </div>
                <div>
                    <div className="page-panel">
                        <h4>Information</h4>
                        {userDocument && <>
                            <div className="edit-model-info-item">
                                <span>join</span>
                                {userDocument.created_at && <p>{moment(userDocument.created_at).fromNow()} </p>}
                            </div>
                        </>}
                        <div className="edit-model-info-item">
                            <span>role</span>
                            <div className="user-role-form">
                                <select value={editedUser.role} onChange={e => setEditedUser(user => ({ ...user, role: parseInt(e.target.value) }))} className="app-input user-role-input">
                                    {new Array(3 - (user?.role as number)).fill(0).map((v, index) => (
                                        <option key={index} value={3 - index}>{getUserRole(3 - index)}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="page-panel avatar-panel">
                        <h4>Avatar</h4>
                        <div onClick={() => {
                            controller.modals.modelPicker.open(getModelByName("media"), media => {
                                setEditedUser(user => ({
                                    ...user,
                                    avatar: media[0]
                                }))
                            });
                        }} className="profile-avatar">
                            <MediaComp className="profile-img" media={editedUser.avatar || defaultProfileAvatar} />
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}