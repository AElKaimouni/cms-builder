import { ModelField, StringField, useBuilderContext } from "../builder";
import { BuilderComp, BuilderMedia, WC } from "../builder/types";
import Image from "next/image";
import { DetailedHTMLProps, HTMLAttributes } from "react";
import { placeholderImage, resizeMedia } from "../helpers";
import Lottie from "../comps/Lottie";

export interface MediaProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    media?: BuilderMedia;
    alt?: WC<string>;
    width?: number;
    height?: number;
    icon?: boolean;
    contexts?: any[]
}

const MediaProps = {
    media: ModelField({ model: "media", query: "{ public_id width height type url }", default: placeholderImage }),
    alt: StringField({ type: "long" })
};

export const mediaProps = (plceholder?: any) => ({
    media: ModelField({ model: "media", query: "{ public_id width height type url }", default: plceholder === undefined ? placeholderImage : plceholder }),
    alt: StringField({ type: "long" })
})

const Media = ({ media, alt, height, width, icon, contexts, ...props } : MediaProps) => {
    const { c, style } = useBuilderContext();

    media = media || placeholderImage;

    if(media.type === "raw") {
        return <Lottie key={media.url} {...c(props, media, ...(contexts || []))} {...props} url={media.url} />
    }

    if(icon) { width = 100; height = 100; }

    if(width && !height) height = Math.ceil(width * (media.height / media.width));
    if(!width && height) width = Math.ceil(height * (media.width / media.height));

    const url = resizeMedia(media, width, height);

    return (
        <div {...style(c(props, media), props.style || {})} {...props} className={(icon ? "AppIcon " : "AppImage ") + (props.className || "") } >
            <Image src={media.type === "video" ? media.url.replace(/^(.*)\.[^\.]*$/, "$1.jpg") : url} width={width || media.width} height={height || media.height} alt={alt?.[0]} />
        </div>
    )
}

export const MediaComp : BuilderComp = {
    comp: Media,
    name: "Media",
    props: MediaProps,
}
