import slugify2 from "slugify";
import { PageModel } from "../database";

export const slugify = async (name: string) => {
    const slugOptions = {
        lower: true,
        strict: true
    };

    const baseSlug = slugify2(name, slugOptions);

    let slug = baseSlug;
    let slugExists = await PageModel.findOne({ slug: slug });
    let suffix = 1;
    
    while (slugExists) {
        slug = `${baseSlug}-${suffix}`;
        slugExists = await PageModel.findOne({ slug: slug });
        suffix++;
    }

    return slug;
}