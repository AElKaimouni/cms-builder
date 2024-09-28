import type { AppProps } from "next/app";
import { ContextProvider } from "../states";
import { useRouter } from "next/router";
import { useEffect } from "react";
import "../styles/index.scss";


const loadStart = () => {
    document.body.classList.remove("page-loaded")
}

function MyApp({ Component, pageProps }: AppProps) {
    const router = useRouter();
    const targetLocale = router.locale; // Replace with your actual way of getting the target locale

    return (
        <ContextProvider>
            <Component {...pageProps} />
        </ContextProvider>
    )
}

export default MyApp
