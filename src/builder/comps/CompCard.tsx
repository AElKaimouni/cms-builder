import { HtmlIcon, SectionIcon } from "../icons";
import { useBuilderContext } from "../states";
import { BuilderComp, ParsedComp } from "../types";

interface CompCardProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    name: string;
    clickable?: boolean;
    type?: "comp" | "section";
}

const CompCard = ({ name, type, clickable, ...props } : CompCardProps) => {
    const context = useBuilderContext();

    return (
        <div 
            {...props}
            className={`__Builder-CompCard ${clickable ? "__Builder_Clickable" : ""} ${props.className || ""}`}
        >
            {type === "section" ? <SectionIcon /> : <HtmlIcon />}
            <span>{name}</span>
        </div>
    )
}

export default CompCard;