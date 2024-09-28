import NextLink from "next/link";


export default ({children, href, ...props} : React.ComponentProps<typeof NextLink>) => {
    if(href && href[0] === "/") return (
        <NextLink prefetch={false} href={href} >
            <a {...props} onClick={e => {
                if(window.__builder_context) e.preventDefault();
            }}>{children}</a>
        </NextLink>
    )

    return (
        <a {...props} href={(href || "").toString()} onClick={e => {
            if(window.__builder_context) e.preventDefault();
        }}>{children}</a>
    )
}