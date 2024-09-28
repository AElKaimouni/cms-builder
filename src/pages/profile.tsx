import { useMemo, useRef, useState } from "react";
import { Breadcrumps, Field, Layout, Loader, Media as MediaComp } from "../comps"
import { useMainContext } from "../states"
import { FieldTypes, User, UserRole } from "../types";
import { defaultProfileAvatar, getModelByName, getUserRole, useLoader } from "../utils";
import StringField from "../comps/fields/StringField";
import lodash from "lodash";
import { Media } from "../types/media";
import { checkFields, emailValidator, passwordValidator, usernameValidator } from "../utils/validators";
import { UserActions } from "../states/reducers/user";
import { UsersAPi } from "../APIs";

export default () => {
    const { user, controller, reducers } = useMainContext();
    const [ editedUser, setEditedUser ] = useState<User>(user as User);
    const [ avatar, setAvatar ] = useState<Media>(user?.avatar || defaultProfileAvatar);
    const [ cPassword, setCPassword ] = useState<string>();
    const [saveLoading, saveLoader] = useLoader();
    const changed = useMemo(() => {
        return !lodash.isEqual(
            [{...editedUser, password: undefined}, editedUser.avatar?._id],
            [{...user, password: undefined}, avatar?._id]
        ) || editedUser.password
    }, [user, editedUser, avatar]) ;
    const ref = useRef<HTMLElement>();

    const save = () => {
        if(ref.current && checkFields(ref.current)) {
            const info = {
                first_name: editedUser.first_name,
                last_name: editedUser.last_name,
                name: editedUser.name,
                email: editedUser.email,
                ...(avatar ? {
                    avatar: avatar._id
                } : {}),
                ...(editedUser.password ? {
                    password: editedUser.password
                } : {})
            };

            saveLoader.process(async () => {
                const newUser = {
                    ...(user as User),
                    name: info.name,
                    email: info.email,
                    avatar: avatar || user?.avatar,
                    first_name: info.first_name,
                    last_name: info.last_name,
                };

                await UsersAPi.updateUser({
                    user: { _id: user?._id },
                    data: info
                });
                
                reducers.user({ type: UserActions.SET, user: newUser });
                setEditedUser(newUser);
            });
        }
    }

    return (
        <Layout>
            <Breadcrumps title="Profile" items={[
                {
                    name: "Dashboard",
                    link: "/"
                },
                {
                    name: "Profile"
                }
            ]} >
                <button onClick={save} disabled={!changed} className="app-button primary">
                    {saveLoading ? <Loader button /> : "Save"}
                </button>
            </Breadcrumps>
            <div className="profile-cnt">
                <div ref={ref as any} className="page-panel fields-panel info-panel">
                    <h2>General Informations</h2>
                    <Field methods={[]} label="" controller={[ user as User, editedUser, setEditedUser ]} props={{
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
                </div>
                <div className="page-panel avatar-panel">
                    <div onClick={() => {
                        controller.modals.modelPicker.open(getModelByName("media"), media => {
                            setAvatar(media[0]);
                        });
                    }} className="profile-avatar">
                        <MediaComp className="profile-img" media={avatar} />
                    </div>
                    <div className="profile-info">
                        <p className="user-name">{user?.name}</p>
                        <p className="user-email">{user?.email}</p>
                        <p className="user-role">{getUserRole(user?.role as UserRole)}</p>
                    </div>
                </div>
            </div>
        </Layout>
    )
}