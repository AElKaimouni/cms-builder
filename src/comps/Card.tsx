import { HTMLProps, ReactNode } from "react";
import { MediaImage } from "../types/media";
import Media from "./Media";

interface Props extends HTMLProps<HTMLDivElement> {
    image?: MediaImage;
    title?: string;
    description?: string;
    children?: ReactNode;
}

export default ({ image, title, description, children, ...props } : Props) => {

    return (
        <div {...props} className={"app-card " + props.className || ""} style={{
            ...props.style,
            ...(props.onClick ? { cursor: "pointer" } : {})
        }}>
            { image && <Media className="card-image" media={image} /> }
            { title && <h4 className="card-title">{title}</h4> }
            { description && <p className="card-desc">{description}</p> }
            { children }
        </div>
    )
}