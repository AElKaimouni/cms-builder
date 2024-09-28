import { AxiosError } from "axios";
import { useRouter } from "next/router";
import { ParsedPageDocument } from "../builder/types";

import { builder } from "../builder.config";
import { GetStaticPropsContext } from "next";
import mainConfig from "../../config";
import { useEffect } from "react";
import PageLoader from "../comps/PageLoader";
import { Page404 } from "../comps";


const isServer = typeof window === 'undefined'

interface PageProps {
    page: ParsedPageDocument;
}

export const getStaticProps = async ({ params, locale  } : GetStaticPropsContext<{ page?: string[] }>) => {
    const link = `/${params?.page ? params?.page.join("/") : ""}`;

    try {
        const res = await builder.api.post("/page", { link, locale, domain: mainConfig.env.NEXT_DOMAIN_ID, published: true });

        return { props: { page: res ? await builder.validatePage(res.data) : null } }
    } catch(error) {
        if(error instanceof AxiosError && error?.response?.status === 404) return {
            props: { page: null }
        }
        throw new Error(`page : ${link} locale : ${locale} has error : \n ${error.message}`);
    }
}

export const getStaticPaths = async () => {
    return {
        paths: [] ,
        fallback: true,
    }
}

const BuilderPage = ( { page } : PageProps ) => {
	const router = useRouter();
    const dir = router.locale === "ar" ? "rtl" : "ltr";

    useEffect(() => {
        document.documentElement.dir = dir;
    },[dir]);

    if(router.isFallback) return <PageLoader />;

    if(!page) return <Page404 />

    return (
        <>
            <builder.Root page={page} callBack={(info, theme) => {
                console.log(info, theme);
            }} />  
        </>
    )
}

export default BuilderPage;