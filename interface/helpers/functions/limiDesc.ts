const limitDesc = (desc: string, limit: number) : string => {
    if(desc.length > limit) return desc.slice(0, limit) + "...";
    else return desc;
}

export default limitDesc;