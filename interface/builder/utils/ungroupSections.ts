import { BuilderGroupedComps, BuilderComps } from "../types";

export const ungroupSections = (groupedSection: BuilderGroupedComps) : BuilderComps => {
    const sections: BuilderComps = {};

    for(let groupKey in groupedSection) {
        const group = groupedSection[groupKey];

        group.forEach(section => {
            sections[section.name] = section;
        })
    }

    return sections;
}
