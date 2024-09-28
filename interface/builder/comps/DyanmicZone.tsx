import { isArray } from "graphql-query-to-json";
import { ReactNode, useEffect } from "react";
import { useBuilderContext } from "../states";
import { WCList } from "../types";

interface DyanmicZoneProps {
    data: WCList<any>;
    custom?: {
        [key: string]: (...props: any) => JSX.Element;
    }
}

const DyanmicZone = ({ data, custom } : DyanmicZoneProps) => {
    const { comps, elements } = useBuilderContext();
    return (
        <>
            {data[0].map((data, index) => {
                const isArray = Array.isArray(data);
                const compName = isArray ? data[2] : data.__comp;
                const context = isArray ? data[3] : data.__context;

                if(custom && custom[compName]) {
                    const Comp = custom[compName];

                    return <Comp key={index} {...(typeof data === "object" && !isArray ? data : { props: data })} />;
                } else {
                    const comp = elements[compName] || comps[compName];

                    if(comp) {    
                        return <comp.comp key={index} {...(typeof data === "object" && !isArray ? data : { props: data })} />
                    }
                }


            })}
        </>
    )
}

export default DyanmicZone;