import Script from "next/script";
import { DetailedHTMLProps, HTMLAttributes, MutableRefObject, useEffect, useRef } from "react";

interface LottieProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    url: string;
    reverse?: boolean;
    options?: any;
    hover?: boolean;
    autoplay?: boolean;
    mode?: string;
}

const Lottie = ({ mode, autoplay, hover, url, reverse, options, ...props } : LottieProps) => {
    return (
        <div className="Lottie-cnt" {...props}>
            <lottie-player
                hover={hover}
                autoplay={autoplay === undefined ? true : autoplay}
                loop
                mode={mode ? mode : "normal"}
                src={url}
                
                className={`${props.className} Lottie-Icon`}
            >
            </lottie-player>
        </div>

    );
}

export default Lottie;