import { useState } from "react";
import { Breadcrumps, Field, Layout, Loader } from "../../comps"
import { useParams } from "react-router-dom";
import { defaultDomain, useDataLoader, useLoader } from "../../utils";
import { Domain } from "../../types/domain";
import { DomainAPi } from "../../APIs";
import { FieldTypes } from "../../types";
import moment from "moment";
import { useMainContext } from "../../states";

export default () => {
    const { controller: { router } } = useMainContext();
    const [domainID, setDomainID] = useState<string | undefined>(useParams().id as string);
    const [loading, loader] = useLoader();
    const [saveLoading, saveLoader] = useLoader();
    const [publishLoading, publishLoader] = useLoader();
    const [domain, setDomain, initDomain] = useDataLoader<Domain>(load, loader, [], defaultDomain);

    async function load() : Promise<Domain> {
        if(domainID) return DomainAPi.get(domainID);
        else return defaultDomain;
    };

    const publish = () => publishLoader.process(async () => {
        if(domainID) {
            await DomainAPi.publish(domainID);
            setDomain({ ...domain, published: !domain.published });
        }
    });

    const save = () => saveLoader.process(async () => {
        if(domainID) {
            const res = await DomainAPi.update({
                name: domain.name,
                host: domain.host
            }, domainID);

            setDomain(res);
        } else {
            const res = await DomainAPi.create({
                name: domain.name,
                host: domain.host
            });

            router.navigate(`domains/form/${res._id}`);
            setDomainID(res._id);
            setDomain(res);
        }
    });

    return (
        <Layout>
            <Breadcrumps className="app-edit-model-breadcrumbs" title={`${domainID ? "Edit" : "New"}`} items={[
                {
                    name: "models",
                    link: "/models"
                },
                {
                    name: `${domainID ? "Edit" : "New"}`
                }
            ]} >
                <button onClick={publish} disabled={domain.published === undefined || publishLoading} className="app-button primary">
                    {publishLoading ? <Loader /> : (domain.published ? "Unpublish" : "Publish") }
                </button>
                <button disabled={saveLoading} className="app-button success" onClick={save}>
                    {saveLoading ? <Loader /> : `${domainID ? "update" : "save"}`}
                </button>
            </Breadcrumps>
            {loading && !domain && <Loader />}
            {domain && <>
                <div className="app-edit-model">
                    <div>
                        <div className="page-panel fields-panel">
                            <Field key={domain._id} label="" controller={[initDomain, domain, setDomain]} methods={[]} props={{
                                host: {
                                    __type: FieldTypes.String,
                                    __args: {
                                        type: "short"
                                    }
                                }
                            }}/>
                        </div>
                    </div>
                    <div>
                        {domainID && <div className="page-panel edit-model-info">
                            <h4>Information</h4>
                            <div className="edit-model-info-item">
                                <span>created</span>
                                <p>{moment(domain.created_at).fromNow()}</p>
                            </div>
                            <div className="edit-model-info-item">
                                <span>by</span>
                                <a href="javascript:void;">
                                    <p>{domain.created_by.name}</p>
                                </a>
                            </div>
                            {domain.updated_at && domain.updated_by && <>
                                <div className="edit-model-info-item">
                                    <span>last update</span>
                                    <p>{moment(domain.updated_at).fromNow()}</p>
                                </div>
                                <div className="edit-model-info-item">
                                    <span>by</span>
                                    <a href="javascript:void;">
                                            <p>{domain.created_by.name}</p>
                                        </a>
                                </div>
                            </>}
                        </div>}
                        <div className="page-panel fields-panel">
                            <Field key={domain._id} label="" controller={[initDomain, domain, setDomain]} methods={[]} props={{
                                name: {
                                    __type: FieldTypes.String,
                                    __args: {
                                        type: "short"
                                    }
                                }
                            }}/>
                        </div>
                    </div>
                </div>
            </>}
        </Layout>
    )
}