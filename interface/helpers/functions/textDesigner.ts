const designText = (text?: string) : string => {
    if(text) return text.replace(/"[^"]*"/, x => `<span class='GradientText'>${x.replace(/"/g, "")}</span>`);
    else return "";
}

export default designText;