export const validLink = (link: string) : [string | undefined, string] | null => {
    const context = window.__builder_context;
    const test = /\/([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(link);

    if(!test) return null;

    const regExp = new RegExp(`^\/(?:(${Object.values(context.wapi.info.locales).join("|")})\/?)?(.*)$`);
    const match = link.match(regExp);

    if(!match) return null;
    
    return [match[1], "/" + match[2]];
}