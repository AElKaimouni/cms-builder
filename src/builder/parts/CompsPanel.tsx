import { useEffect, useMemo, useRef, useState } from "react";
import { CmsAPi } from "../../APIs";
import { PageSection, Props } from "../classes";
import CompCard from "../comps/CompCard";
import BuilderContextMenu from "../comps/ContextMenu";
import MenuHeader from "../comps/MenuHeader";
import { ChevDownIcon, ChevRightIcon, HtmlIcon, SectionIcon } from "../icons";
import { LayoutActions, PageActions, useBuilderContext } from "../states";
import { BuilderComp, BuilderGroupedComps, BuilderSymbol } from "../types";
import { appendSection, compDragHandler, useActivePanelHandler, useContextMenu, useGroupes } from "../utils";
import { BuilderModals } from "../utils/modals";

let DeleteSymbolActionID = 0;

enum CompsPanels {
    SectionsPanel,
    ElementsPanel,
    CompsPanel
}

const CompsPanel = () => {
    const { wapi, page, layout } = useBuilderContext();
    const [ activePanel, setActivePanel ] = useState<CompsPanels>(CompsPanels.SectionsPanel);
    const { sections, elements, comps } = wapi.info;
    const [ sectionsGroups, toggleSectionsGroup ] = useGroupes();
    const [ compsGroups, toggleCompsGroup ] = useGroupes();
    const [ elementsGroups, toggleElementsGroup ] = useGroupes();
    const [ search, setSearch ] = useState<string>("");
    const searchRegExp = useMemo(() => new RegExp(search, "i"), [search]);
    const ref = useRef<HTMLElement>();
    const { props, eventHandler } = useContextMenu(ref);
    const [contextMenuName, setContextMenuName] = useState<string>("");
    const [targetSection, setTargetSection] = useState<BuilderComp & { symbol?: BuilderSymbol }>();
    const sectionsMenuActions = [
        [
            {
                name: "Append",
                callBack: () => appendSection(targetSection as any, page.module.locale.sections.length)
            },
            {
                name: "Prepend",
                callBack: () => appendSection(targetSection as any, 0)
            }
        ],
        ...(targetSection?.symbol ? [[
            {
                name: "Delete",
                callBack: () => {
                    layout.set({ type: LayoutActions.Modal, modal: BuilderModals.ConfirmModal, info: {
                        message: `Are you sure you wanna delete ${targetSection.symbol?.__name}, you cant undo that ?!`,
                        title: "Deleting Symbol",
                        cancel: "Cancel",
                        confirm: "Delete"
                    }, callBack: async answer => {
                        if(answer) try {
                            const ID = targetSection.symbol?._id;
                            if(typeof ID === "string" && targetSection.symbol) {
                                const actionID = `Delete_Symbol_${DeleteSymbolActionID++}`;
                                await CmsAPi.post("/symbol/delete", { ids: [ID] });

                                page.module.locale.sections.filter(section => section.symbol?.__ref === `Symbol_${ID}`).forEach(section => {
                                    section.delete(actionID);
                                });

                                page.set({ type: PageActions.DeleteSymbol, symbol: targetSection.symbol })

                                setTimeout(() => delete page.module.document.symbols[ID], 0);
                            }
                        } catch(error) { throw error }
                    } })
                }
            },
        ]] : [])
    ];
    const sectionWithSymbols = useMemo(() => ({
        Symbols: !layout.loading ? page.state.symbols.filter(s => s.locale === page.state.locale).map(symbol => {
            const section = wapi.sections[symbol.comp];

            return {
                name: symbol.__name,
                props: section.props instanceof Props ?  section.props.__props : section.props.__field,
                fixed: section.fixed,
                display: section.display,
                style: section.style,
                symbol,
                type: "section"
            }
        }) : [],
        ...sections
    }), [page.state.symbols, page.state.locale, sections, wapi.sections]);


    useActivePanelHandler(ref, "Comps");

    return (
        <div ref={ref as any} id="__Builder-Comps" >
            <div id="__Builder-Comps-Menu">
                <input id="__Builder-Comps-Search" type="search" placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} />
                <MenuHeader items={[
                    {
                        name: "Sections",
                        icon: <SectionIcon />,
                        controller: [activePanel === CompsPanels.SectionsPanel, () => setActivePanel(CompsPanels.SectionsPanel)]
                    },
                    {
                        name: "Components",
                        icon: <HtmlIcon />,
                        controller: [activePanel === CompsPanels.CompsPanel, () => setActivePanel(CompsPanels.CompsPanel)]
                    },
                    {
                        name: "Elements",
                        icon: <HtmlIcon />,
                        controller: [activePanel === CompsPanels.ElementsPanel, () => setActivePanel(CompsPanels.ElementsPanel)]
                    }
                ]} />
            </div>
            <div id="__Builder-Comps-List">

                {activePanel === CompsPanels.SectionsPanel && <>
                        <div className="__Builder-Comps-Group">
                            {Object.keys(sectionWithSymbols).filter(g => g !== "__Builder_Group").map(groupKey => {
                                const group = sectionWithSymbols[groupKey].filter(comp => comp.name && searchRegExp.test(comp.name));
                                const active = sectionsGroups[groupKey] !== false;

                                if(group.length) return (
                                    <div key={groupKey}>
                                        <div className={`__Builder-Comps-Group-Header ${active ? "active" : ""}`} 
                                            onClick={() => toggleSectionsGroup(groupKey)}
                                        >
                                            {active ? <ChevDownIcon /> : <ChevRightIcon />} {groupKey.replace(/_/g, " ")}
                                        </div>
                                        {active && <div className="__Builder-Comps-Group-List __Builder-Sections">
                                            {group.map(comp => {
                                                return <CompCard type="section" key={comp.name} name={comp.name as string} 
                                                    {...compDragHandler(comp.symbol ? comp : wapi.sections[comp.name]) as any}
                                                    onContextMenu={e => {
                                                        setContextMenuName(comp.name);
                                                        eventHandler(e as any);
                                                        setTargetSection(comp);
                                                    }} 
                                                />
                                            })}
                                        </div>} 
                                    </div>
                                )
                            })}
                        </div>
                    </>}
                    {activePanel === CompsPanels.CompsPanel && <>
                        <div className="__Builder-Comps-Group">
                            {Object.keys(comps).map(groupKey => {
                                const group = comps[groupKey].filter(comp => comp.name && searchRegExp.test(comp.name));
                                const active = compsGroups[groupKey] !== false;

                                if(group.length) return (
                                    <div key={groupKey}>
                                        <div className={`__Builder-Comps-Group-Header ${active ? "active" : ""}`} 
                                            onClick={() => toggleCompsGroup(groupKey)}
                                        >
                                            {active ? <ChevDownIcon /> : <ChevRightIcon />} {groupKey.replace(/_/g, " ")}
                                        </div>
                                        {active && <div className="__Builder-Comps-Group-List">
                                            {group.map(comp => {
                                                return <CompCard {...compDragHandler(wapi.comps[comp.name]) as any} key={comp.name} name={comp.name as string} />
                                            })}
                                        </div>} 
                                    </div>
                                )
                            })}
                        </div>
                    </>}
                    {activePanel === CompsPanels.ElementsPanel && <>
                        <div className="__Builder-Comps-Group">
                            {Object.keys(elements).map(groupKey => {
                                const group = elements[groupKey].filter(comp => comp.name && searchRegExp.test(comp.name));
                                const active = elementsGroups[groupKey] !== false;

                                if(group.length) return (
                                    <div key={groupKey}>
                                        <div className={`__Builder-Comps-Group-Header ${active ? "active" : ""}`} 
                                            onClick={() => toggleElementsGroup(groupKey)}
                                        >
                                            {active ? <ChevDownIcon /> : <ChevRightIcon />} {groupKey.replace(/_/g, " ")}
                                        </div>
                                        {active && <div className="__Builder-Comps-Group-List">
                                            {group.map(comp => {
                                                return <CompCard {...compDragHandler(wapi.elements[comp.name]) as any} key={comp.name} name={comp.name as string} />
                                            })}
                                        </div>} 
                                    </div>
                                )
                            })}
                        </div>
                    </>}
            </div>
            <BuilderContextMenu {...props} name={contextMenuName} props={sectionsMenuActions} />
        </div>
    )
}

export default CompsPanel;