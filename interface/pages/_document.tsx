import { NextComponentType } from 'next';
import Document, { DocumentContext, Html, Head, Main, NextScript } from 'next/document';
import { NextRouter, withRouter } from "next/router";
import Script from 'next/script';


interface WithRouterProps {
    router: NextRouter
}

interface DocumentProps extends WithRouterProps {}

class MyDocument extends Document<DocumentProps> {
    static async getInitialProps(ctx: DocumentContext) {
        const initialProps = await Document.getInitialProps(ctx)

        return { ...initialProps, locale: ctx?.locale }
    }

    render() {
        const locale = this.props.locale;
        const dir = locale === "ar" ? "rtl" : "ltr";
        
        
        return (
          <Html dir={dir} lang={locale}>
            <Head>
                <meta charSet="utf-8" />
                <meta name="format-detection" content="telephone=no"></meta>

                <title>A El Kaimouni</title>
                <meta name="description" content="Hi there! I'm El Kaimouni Abderrahmane, a dedicated Software Engineer and Data Scientist student passionate about crafting innovative solutions. Specializing in Web Development, skilled in both frontend and backend, I excel in DevOps practices, I'm proficient in deploying projects on various hosting environments, including VPS and cloud services, I bring a wealth of technical expertise to the table." />

                <link rel="icon" href="/favicon.png" />

                <link rel="stylesheet" href="/css/bootstrap.css"/>
                <link rel="stylesheet" href="/css/font-awesome.css"/>
                <link rel="stylesheet" href="/css/fakeLoader.css"/>
                <link rel="stylesheet" href="/css/owl.carousel.css"/>
                <link rel="stylesheet" href="/css/owl.theme.default.css"/>
                <link rel="stylesheet" href="/css/magnific-popup.css"/>
                <link rel="stylesheet" href="/css/style.css"/>

            </Head>
            <body>
                <Main />
                <NextScript />
                

                <Script src="/js/jquery.min.js" strategy='beforeInteractive' />
                <Script src="/js/bootstrap.min.js" strategy='beforeInteractive' />
                <Script src="/js/fakeLoader.min.js" strategy='beforeInteractive' />
                <Script src="/js/owl.carousel.min.js" strategy='beforeInteractive' />
                <Script src="/js/jquery.filterizr.min.js" strategy='beforeInteractive' />
                <Script src="/js/imagesloaded.pkgd.min.js" strategy='beforeInteractive' />
                <Script src="/js/jquery.magnific-popup.min.js" strategy='beforeInteractive' />

                <Script src="/js/contact-form.js" strategy='lazyOnload' />
                <Script src="/js/main.js" strategy='lazyOnload' />
            </body>
          </Html>
        )
      }
}

export default withRouter(MyDocument as NextComponentType<DocumentContext, any, any>);
