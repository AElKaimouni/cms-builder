import { useEffect, useMemo, useRef, useState } from "react";
import { Breadcrumps, Field, Layout, Loader } from "../../comps"
import { useMainContext } from "../../states";
import { useParams } from "react-router-dom";
import { DeleteIcon, LinkIcon, checkModelPerms, defaultPage, useDataLoader, useInitData, useList, useLoader, useSelect, validateLink } from "../../utils";
import { PageLocaleObject, PageObject } from "../../types/pages";
import { PageAPi } from "../../APIs";
import { FieldTypes, LocaleObject } from "../../types";
import moment from "moment";
import lodash from "lodash";
import { checkFields } from "../../utils/validators";

export default () => {
    const { user, controller: { router, modals }, status } = useMainContext();
    const [pageID, setPageID] = useState<string | undefined>(useParams().id as string);
    const [loading, loader] = useLoader();
    const [saveLoading, saveLoader] = useLoader();
    const [publishLoading, publishLoader] = useLoader();
    const [page, setPage, initPage, loadPage] = useDataLoader<PageObject>(load, loader, [], defaultPage);
    const [initDomain, domain, setDomain, setInitDomain] = useInitData<string>(status.domains[Object.keys(status.domains)[0]]?.name);
    const [locale, setLocale] = useState<string>(page.versions[0]?.locales[0]?.locale);
    const changed = useMemo(() => !lodash.isEqual(
        [
            page.versions[0]?.locales.map(l => ({ meta: l.meta })),
            page.name,
            domain,
            page.link,
            page.slug
        ],
        [
            initPage.versions[0]?.locales.map(l => ({ meta: l.meta })),
            initPage.name,
            initPage.domain.name,
            initPage.link,
            initPage.slug
        ]
    ), [page, initPage]);
    const canPublishChanges = useMemo(() => {
        if(changed) return false;

        return !lodash.isEqual(
            page.versions[0]?.locales.filter(l2 => page.locales.find(l => l.locale === l2.locale)).map(l => ({ meta: l.meta })),
            page.locales.map(l => ({ meta: l.meta }))
        )
    }, [page, changed]);
    const ref = useRef<HTMLElement>();



    useEffect(() => {
        setPage({ ...page, domain: status.domains[domain as string] });
    }, [domain]);

    async function load() : Promise<PageObject> {
        if(pageID) {
            const page = await PageAPi.get({ _id: pageID });
            setDomain(page.domain.name);
            setInitDomain(page.domain.name);

            return page;
        } else return defaultPage;
    };

    const publish = () => publishLoader.process(async () => {
        if(pageID) {
            await PageAPi.publish({ _id : pageID });
            loadPage({ ...page, published: !page.published });
        }
    });

    const save = () => saveLoader.process(async () => {
        if(pageID) {
            if(changed && ref.current && checkFields(ref.current)) {
                const res = await PageAPi.update({
                    page: { _id: pageID },
                    data: {
                        slug: page.slug,
                        link: validateLink(page.link),
                        name: page.name,
                        targets: page.targets,
                        locales: page.versions[0]?.locales.map((l, index) => ({
                            index,
                            meta: l.meta
                        }))
                    }
                });
    
                loadPage(res);
            } else if(canPublishChanges) {
                const res = await PageAPi.publishChanges({ _id : pageID });
                
                loadPage(res);
            }
        } else if(ref.current && checkFields(ref.current)) {
            const res = await PageAPi.create({
                slug: page.slug,
                link: validateLink(page.link),
                name: page.name,
                targets: page.targets,
                domain: status.domains[domain as string]._id
            });

            router.navigate(`pages/form/${res._id}`);
            setPageID(res._id);
            loadPage(res);
        }
    });


    return (
        <Layout>
            <Breadcrumps className="app-edit-model-breadcrumbs" title={`${pageID ? "Edit" : "New"}`} items={[
                {
                    name: "models",
                    link: "/models"
                },
                {
                    name: `${pageID ? "Edit" : "New"}`
                }
            ]} >
                <a href={`/admin/builder?page=${page.slug}`} target="_blank">
                    <button disabled={!Boolean(pageID)} style={{ display: "inline-block" }} className="app-button primary icon">
                        <span >Builder</span> <LinkIcon />
                    </button>
                </a>
                {((pageID && checkModelPerms(user, "pages", 2)) || (!pageID && checkModelPerms(user, "pages", 0))) && <>
                    {pageID && <button onClick={publish} disabled={!pageID || publishLoading} className="app-button primary">
                        {publishLoading ? <Loader button /> : (page.published ? "Unpublish" : "Publish") }
                    </button>}
                    <button disabled={saveLoading || (!changed && !canPublishChanges)} className="app-button success" onClick={save}>
                        {saveLoading ? <Loader button /> : `${pageID ? (changed || !canPublishChanges ? "update" : "publish changes") : "save"}`}
                    </button>
                </>}
            </Breadcrumps>
            <div className="app-edit-model" ref={ref as any}>
                <div>
                    <div className="page-panel fields-panel">
                        <Field context={`${locale}_pages_${pageID || ""}`} loading={loading} key={page._id} label="" controller={[initPage, page, page => setPage({
                            ...page,
                            link: validateLink(page.link)
                        })]} methods={[]} props={{
                            link: {
                                __type: FieldTypes.String,
                                __args: {
                                    type: "short",
                                    validate: {
                                        required: true,
                                        unique: true,
                                        custom: val => {
                                            if(!/^(?!.*\/\/)([a-zA-Z-\/]*)$/.test(val)) return "Please enter a valid link (ex: /about)"
                                        }
                                    }
                                }
                            },
                            slug: {
                                __type: FieldTypes.String,
                                __args: {
                                    type: "short",
                                    generator: async() => PageAPi.generateSlug({ title: page.slug || page.name || page.link || "page" }),
                                    validate: {
                                        unique: true,
                                        required: true
                                    }
                                },
                            }
                        }}/>
                    </div>
                    <div style={{ overflow: "unset" }} className="page-panel p-0">
                        <table className="app-table page-locales-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>URL</th>
                                    <th>Locale</th>
                                    <th>State</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {page && page.versions && page.versions[0] && page.versions[0].locales.map((pageLocale, index) => {
                                    const isPublished = page.locales.find(l => l.locale === pageLocale.locale);

                                    return (
                                        <tr className={pageLocale.locale === locale ? "active" : ""} onClick={() => setLocale(pageLocale.locale)} key={index}>
                                            <td>{pageLocale.meta.title}</td>
                                            <td>
                                                {`/${pageLocale.locale}${page.link === "/" ? "" : page.link}`}
                                            </td>
                                            <td>
                                                {pageLocale.locale.toUpperCase()}
                                            </td>
                                            <td>
                                                <div className={`badge ${isPublished ? "success" : ""}`}>{isPublished ? "Published" : "Draft"}</div>
                                            </td>
                                            <td className="unclickable">
                                                <a href={`/admin/builder?page=${page.slug}&locale=${locale}`} target="_blank">
                                                    <button style={{ display: "inline-block" }} className="app-button primary icon">
                                                        <span >Builder</span> <LinkIcon />
                                                    </button>
                                                </a>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                        {loading && <Loader fluid />}
                    </div>
                    {locale && <div className="page-panel fields-panel">
                        <Field loading={loading} key={page._id} label="" controller={[initPage, page.versions[0].locales.find(l => l.locale === locale)?.meta || {}, meta => setPage({
                            ...page,
                            versions: [{
                                ...page.versions[0],
                                locales: page.versions[0].locales.map(l => {
                                    if(l.locale === locale) return {
                                        ...l,
                                        meta
                                    }; else return l;
                                })
                            }]
                        })]} methods={[]} props={{
                            title: {
                                __type: FieldTypes.String,
                                __args: {
                                    type: "short"
                                }
                            },
                            description: {
                                __type: FieldTypes.String,
                                __args: {
                                    type: "long"
                                }
                            }
                        }}/>
                    </div>}
                </div>
                <div>
                    {pageID && <div className="page-panel edit-model-info">
                        <h4>Information</h4>
                        <div className="edit-model-info-item">
                            <span>created</span>
                            <p>{moment(page.created_at).fromNow()}</p>
                        </div>
                        <div className="edit-model-info-item">
                            <span>by</span>
                            <a href="javascript:void;">
                                <p>{page.created_by.name}</p>
                            </a>
                        </div>
                        {page.updated_at && page.updated_by && <>
                            <div className="edit-model-info-item">
                                <span>last update</span>
                                <p>{moment(page.updated_at).fromNow()}</p>
                            </div>
                            <div className="edit-model-info-item">
                                <span>by</span>
                                <a href="javascript:void;">
                                        <p>{page.created_by.name}</p>
                                    </a>
                            </div>
                        </>}
                    </div>}
                    <div className="page-panel fields-panel">
                        <Field loading={loading} label="" controller={[initPage, page, setPage]} methods={[]} props={{
                            name: {
                                __type: FieldTypes.String,
                                __args: {
                                    type: "short"
                                }
                            }
                        }}/>
                        <Field loading={loading} label="Domain" controller={[initDomain, domain, setDomain]} methods={[]} props={{
                            __type: FieldTypes.String,
                            __args: {
                                type: "enum",
                                enums: Object.keys(status.domains)
                            }
                        }}/>
                    </div>
                </div>
            </div>
        </Layout>
    )
}