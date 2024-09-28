import { useParams } from "react-router-dom";
import { Breadcrumps, Layout, ModelTable } from "../../comps";
import { useEffect, useMemo } from "react";
import { AddIcon, checkModelPerms, normalizeModelName } from "../../utils";
import { useMainContext } from "../../states";

export default () => {
    const { user, controller : { router: { navigate, searchParams }, models: { getModel } }, status: { defaultLocale } } = useMainContext();
    const { model } = useParams() as { model: string };
    const modelObject = useMemo(() => getModel(model), [model]);
    const modelName = normalizeModelName(model);

    return (
        <Layout>
            <Breadcrumps title={model} items={[
                {
                    name: "models",
                    link: "/models"
                },
                {
                    name: model
                }
            ]} >
                {checkModelPerms(user, modelName, 0) && 
                    <button onClick={() => navigate(`/models/new/${model}`, { locale: searchParams.get("locale") || defaultLocale })} className="primary icon app-button">
                        <AddIcon /> Add New { modelName }
                    </button>
                }
            </Breadcrumps>
            <ModelTable model={modelObject} />
        </Layout>
    )
};