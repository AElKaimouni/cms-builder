import { useMemo } from "react";
import { Layout, ModelEditor } from "../../comps";
import { useMainContext } from "../../states";
import { useList } from "../../utils";

export default () => {
    const { layout } = useMainContext();
    const { active, isActive, state: [modelID] } = useList(layout.models.length ? layout.models[0].name : null);
    const activeModel = useMemo(() => layout.models.find(model => model.name === modelID), [modelID]);

    return (
        <Layout>
            <div id="app-models" className="page-cnt">
                <div id="models-list-cnt" className="page-panel p-0">
                    <h2 className="app-heading">Models List</h2>
                    <ul className="models-list">
                        {layout.models.map(model => (
                            <li key={model.name}
                                onClick={() => active(model.name)}
                                className={`models-list-item ${isActive(model.name) ? "active" : ""}`}
                            >
                                {model.name}
                            </li>
                        ))}
                    </ul>
                </div>
                <div id="app-model" className="page-panel p-0">
                     {activeModel && <ModelEditor model={activeModel} />}
                </div>
            </div>
        </Layout>
    );
}