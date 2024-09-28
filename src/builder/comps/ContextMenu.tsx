import { Dispatch, useEffect, useLayoutEffect, useRef, useState } from "react";
import { HtmlIcon } from "../icons";
import { useBuilderContext } from "../states";
import { ContextObject } from "../types";
import { wapiOnClick } from "../wapi";

export interface BuilderContextMenuProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    controller: [boolean, Dispatch<boolean>];
    name?: string;
    position?: { x: number, y: number };
    props: {
        name: string;
        callBack: () => void;
        disabled?: boolean;
    }[][];
    box?: DOMRect;
}

const BuilderContextMenu = ({ box, name, controller, position, props, ...extraProps } : BuilderContextMenuProps) => {
    const { layout } = useBuilderContext();
    const ref = useRef<HTMLElement>();

    useEffect(() => {
        const handler = e => {
            if(!(e.target instanceof HTMLElement && e.target.closest(".__Builder-Context-Menu"))) {
                controller[1](false);
            }
        };

        window.addEventListener("click", handler);
        const clearEvent = wapiOnClick(handler);

        return () => {
            window.removeEventListener("click", handler);
            clearEvent();
        }
    }, []);

    useLayoutEffect(() => {
        if(box && ref.current && position) {
            if(box.top + position.y + ref.current.clientHeight >= window.innerHeight) {
                ref.current.classList.add("__Builder-Up-Mode");
            } else ref.current.classList.remove("__Builder-Up-Mode");

            if(box.left + position.x + ref.current.clientWidth >= window.innerWidth) {
                ref.current.classList.add("__Builder-Left-Mode");
            } else ref.current.classList.remove("__Builder-Left-Mode");
        }
    }, [position, box, ref])

    return (
        <div ref={ref as any} {...extraProps}
            className={`__Builder-Context-Menu ${extraProps.className || ""}`}
            style={position ? { top: position.y, left: position.x, display: controller[0] ? "block" : "none", ...extraProps.style } : { display: "none", ...extraProps.style }}
        >
            {name && <div className="__Builder-Context-Menu-Name">
                <HtmlIcon /> {name}
            </div>}
            {props.map((porpsGroup, index) => (
                <ul key={index}>
                    {porpsGroup.map(prop => {
                        return (
                            <li className={`${prop.disabled ? "__Builder-Disabled-Item" : ""}`} key={prop.name + index} {...(prop.disabled ? {} : {onClick : () => { controller[1](false); prop.callBack(); }})}>
                                {prop.name}
                            </li>
                        )
                    })}
                </ul>
            ))}
        </div>
    )
}

export default BuilderContextMenu;