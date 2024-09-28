import { useParams } from "react-router-dom"
import { Breadcrumps, Field, Layout, Loader } from "../../comps"
import { useMainContext } from "../../states";
import { useEffect, useMemo, useRef, useState } from "react";
import { LinkIcon, ListIcon, checkModelPerms, designModelFields, getPropsDefaultData, useDataLoader, useInitData, useLoader } from "../../utils";
import { FieldTypes, ModelDataObject, ModelObject, PageLocaleObject, PageObject } from "../../types";
import { ModelAPi, PageAPi } from "../../APIs";
import moment from "moment";
import lodash from "lodash";
import { checkFields } from "../../utils/validators";
import { FieldSkeleton } from "../../comps/fields";

export default () => {
    const { user, layout: { models }, controller: { router }, status } = useMainContext();
    const modelName = useParams().model as string;
    const [modelID, setModelID] = useState<string | undefined>(useParams().id as string);
    const model = models.find(m => m.name === modelName) as ModelObject;
    const design = useMemo(() => designModelFields(model, true), []);
    const load = async (id = modelID) => {
        if(id) {
            const data = await ModelAPi.ref(modelName, id, undefined);

            if(data) {
                setSiblingID(data._id);
                setSiblingPageID(data?.page?._id);
            }
            if(data && model.pages) {
                setSlug(data?.page?.slug);
                setInitSlug(data?.page?.slug);
            }

            return data;
        }
    };
    const [loading, loader] = useLoader(Boolean(modelID));
    const [data, setData, initData, loadData] = useDataLoader<ModelDataObject>(load, loader, [], getPropsDefaultData(model.props));
    const [saveLoading, saveLoader] = useLoader();
    const [publishLoading, publishLoader] = useLoader();
    const [siblingID, setSiblingID] = useState<string>();
    const [siblingPageID, setSiblingPageID] = useState<string>();
    const [initSlug, slug, setSlug, setInitSlug] = useInitData<string>("");
    const domain = Object.values(status.domains).find(d => d._id === model.pages?.domain);
    const locale = router.searchParams.get("locale") || undefined;
    const pageLocale = useMemo(() => (data?.page as PageObject)?.versions[0].locales.find(l => l.locale === locale), [data, locale]);
    const initPageLocale = useMemo(() => (initData?.page as PageObject)?.versions[0].locales.find(l => l.locale === locale), [initData, locale]);
    const [formLocale, setFormLocale] = useState<PageLocaleObject | undefined>();
    const changed = useMemo(() => !lodash.isEqual(
        [data, formLocale, slug],
        [initData, pageLocale, data?.page?.slug]
    ), [data, initData, formLocale, pageLocale]);
    const canPublishChanges = useMemo(() => !data.uiPublished && !changed && data.published, [changed, data]);
    const ref = useRef<HTMLElement>();
    
    useEffect(() => { setFormLocale(pageLocale) }, [pageLocale])

    const save = () => saveLoader.process(async () => {
        if(modelID) {
            if(canPublishChanges) {
                await Promise.all([
                    ...(model.pages ? [
                        PageAPi.publishChanges({ _id : data?.page?._id })
                    ] : []),
                    ModelAPi.publishChanges({ id: data._id, model: model.name, locale })
                ])
                
                loadData({ ...data, uiPublished: true });
            } else {
                if(ref.current && checkFields(ref.current)){
                    const page = model.pages ? 
                        await PageAPi.update({
                            page: { _id: data?.page?._id },
                            data: {
                                slug,
                                link: `${model.pages?.link}/${slug}`,
                                [`versions.0.locales.${(data?.page as PageObject)?.versions[0].locales.findIndex(l => l.locale === locale)}.meta`]: formLocale?.meta
                            }
                        })
                    : null;
                    const res = await ModelAPi.update({
                        name: model.name, data,
                        id: data._id, locale
                    });

        
                    loadData(res);
                }
            }
        } else {
            if(ref.current && checkFields(ref.current)){
                const page = model.pages ? (siblingPageID ? await PageAPi.update({
                    page: { _id: siblingPageID },
                    data: {
                        slug,
                        link: `${model.pages?.link}/${slug}`,
                        locales: [{
                            locale,
                            modelData: data
                        }]
                    }
                }) : await PageAPi.create({
                    slug,
                    link: `${model.pages?.link}/${slug}`,
                    name: lodash.get(data, model.primary),
                    domain: model.pages.domain,
                    model: model._id,
                    published: true,
                    locales: locale ? [{
                        locale,
                        meta: formLocale?.meta,
                        modelData: data
                    }] : undefined
                })) : null;

                const res = await ModelAPi.new({
                    name: model.name, locale,
                    data: { 
                        ...data,
                        ...(siblingID ? {
                            _id: `${locale}_${siblingID.split("_")[1]}`
                        } : {}),
                        page: page?._id,
                    }
                });
        
                setModelID(res._id);
                loadData(res);
            }
        }
    });

    const publish = () => publishLoader.process(async () => {
        await Promise.all([
            ...(model.pages  ? [
                PageAPi.publishLocale({ _id : data?.page?._id, locale: locale || status.defaultLocale }),
            ] : []),
            ModelAPi.publish({
                model: model.name,
                id: data._id, locale
            })
        ]);

        loadData(data => ({ ...data, published: !data.published, ...(model.pages ? {
            page: {
                ...data?.page,
                published: !data.published
            }
        } : {}) }))
    })

    const changeLocale = async (e: React.ChangeEvent<HTMLSelectElement>) => loader.process(async () => {
        const newLocale = e.target.value;
        router.searchParams.set("locale", newLocale);

        if(modelID || siblingID) {
            const sibling = await ModelAPi.sibling({
                id: data._id || siblingID || "",
                model: model.name,
                locale: newLocale
            });

            if(sibling) {
                router.navigate(`/models/new/${model.name}/${sibling._id}`, { locale: newLocale });
                setModelID(sibling._id);
                loadData(sibling);
            } else {
                router.navigate(`/models/new/${model.name}`, { locale: newLocale });
                setModelID(undefined);
                loadData(getPropsDefaultData(model.props));
            }
        }
    }) 
    
    return (
        <Layout key={modelID}>
            <Breadcrumps className="app-edit-model-breadcrumbs" title={`${modelID ? "edit" : "add"} ${modelName}`} items={[
                {
                    name: "models",
                    link: "/models"
                },
                {
                    name: modelName
                }
            ]} >
                {model.pages && data?.page && <a href={`/admin/builder?page=${data?.page?.slug}&locale=${locale}`} target="_blank">
                    <button style={{ display: "inline-block" }} className="app-button primary icon">
                        <span >Builder</span> <LinkIcon />
                    </button>
                </a>}
                {((modelID && checkModelPerms(user, modelName, 2)) || (!modelID && checkModelPerms(user, modelName, 0))) && <>
                    {modelID && <button onClick={publish} disabled={data.published === undefined || publishLoading} className="app-button primary">
                        {publishLoading ? <Loader button /> : (data.published ? "Unpublish" : "Publish") }
                    </button>}
                    <button disabled={saveLoading || (!changed && !canPublishChanges)} className="app-button success" onClick={save}>
                        {saveLoading ? <Loader button /> : `${modelID ? (canPublishChanges ? "publish changes" : "update") : "save"}`}
                    </button>
                </>}
            </Breadcrumps>
            <div ref={ref as any} className="app-edit-model">
                <div>
                    {model.pages && <div className="page-panel fields-panel" >
                        <Field loading={loading} label="" context={`${locale}_pages_${data?.page?._id || ""}`} controller={[{
                            slug: initSlug,
                            title: initPageLocale?.meta.title,
                            description: initPageLocale?.meta.description
                        },{
                            slug: slug,
                            title: formLocale?.meta.title,
                            description: formLocale?.meta.description
                        }, entry => { setSlug((entry.slug as string).toLowerCase()); setFormLocale({
                            ...(formLocale as PageLocaleObject),
                            meta: {
                                description: entry.description,
                                title: entry.title
                            }
                        }) }]} methods={[]} props={{
                            slug: {
                                __type: FieldTypes.String,
                                __args: {
                                    type: "short",
                                    prefix: `${domain?.host}/${locale}${model.pages?.link}/`,
                                    width: "100%",
                                    generator: async() => PageAPi.generateSlug({ title: slug || lodash.get(data, model.primary) || model.name }),
                                    validate: {
                                        unique: true,
                                        required: true
                                    }
                                }
                            },
                            title: {
                                __type: FieldTypes.String,
                                __args: {
                                    type: "short",
                                    validate: {
                                        required: true
                                    }
                                }
                            },
                            description: {
                                __type: FieldTypes.String,
                                __args: {
                                    type: "long",
                                }
                            }
                        }} />
                    </div>}
                    <div className="page-panel fields-panel">
                        {design.slice(0, 5).map((props, index) => (
                            <Field loading={loading} key={index + (data._id || "")} label="" context={`${locale}_${model.name}_${modelID}`} controller={[initData, data, setData]} methods={[]} props={props}/>
                        ))}
                    </div>
                    {Object.entries(design[5]).map(([key, props], index) => (<>
                        <Field loading={loading} container key={index + data._id} context={`${locale}_${model.name}_${modelID}.${key}`} prop={key} label={key} controller={[initData[key], data[key], data => setData(d => ({ ...d, [key] : data }))]} methods={[]} props={props}/>
                    </>))}
                </div>
                <div>
                    <div className="page-panel edit-model-info">
                        {modelID && <>
                            <h4>Information</h4>
                            <div className="edit-model-info-item">
                                <span>created</span>
                                {data.created_at && <p>{moment(data.created_at).fromNow()} </p>}
                            </div>
                            <div className="edit-model-info-item">
                                <span>by</span>
                                {data.created_by && <a href="javascript:void;">
                                    <p> {data.created_by.name} </p>
                                </a>}
                            </div>
                            <div className="edit-model-info-item">
                                <span>last update</span>
                                {data.updated_at && <p>{moment(data.updated_at).fromNow()}</p>}
                            </div>
                            <div className="edit-model-info-item">
                                <span>by</span>
                                {data.updated_by && (
                                    <a href="javascript:void;">
                                        <p>{data.updated_by.name}</p>
                                    </a>
                                )}
                            </div>
                        </>}
                        {model.i18n && <>
                            <h4>Locales</h4>
                            <select className="app-input" value={locale || status.defaultLocale} onChange={changeLocale}>
                                {status.locales.map(locale => (
                                    <option key={locale.id} value={locale.id}>
                                        {locale.name} [{locale.ext.toUpperCase()}]
                                    </option>
                                ))}
                            </select>
                        </>}
                    </div>
                    <div className="page-panel fields-panel">
                        {design.slice(6).map((props, index) => (
                            <Field loading={loading} key={index + data._id} label="" context={`${locale}_${model.name}_${modelID}`} controller={[initData, data, setData]} methods={[]} props={props}/>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    )
}