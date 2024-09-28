import { DomainAPi } from "../../APIs";
import { Breadcrumps, Card, Layout, Loader } from "../../comps";
import { useMainContext } from "../../states";
import { AddIcon, useTable } from "../../utils";

export default () => {
    const { controller : { router: { navigate } } } = useMainContext();
    const { models, loading, count } = useTable(async () => {
        const res = await DomainAPi.fetchAll();
        
        return {
            count: res.length,
            models: res
        };
    });

    return (
        <Layout>
            <Breadcrumps title="Domains" items={[
                {
                    name: "Dashboard",
                    link: "/"
                },
                {
                    name: "domains"
                }
            ]} >
                <button onClick={() => navigate(`/domains/form`)} className="primary icon app-button">
                    <AddIcon /> Add New Domain
                </button>
            </Breadcrumps>
            <div className="page-cnt">
                {loading && !models && <Loader />}
                {models && models.map(model => (
                    <Card style={{ width: 200 }} onClick={() => navigate(`/domains/form/${model._id}`)} title={model.name} description={model.host} />
                ))}
            </div>
        </Layout>
    );
}