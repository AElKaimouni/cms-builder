import { ReactNode, useEffect, useRef } from "react";
import { CloseIcon, useModal } from "../utils";

interface BuilderModalProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    children: ReactNode;
    header: ReactNode;
    footer: ReactNode;
    controller: ReturnType<typeof useModal>;
}

export default ({ children, controller, footer, header, ...props } : BuilderModalProps) => {
    const modalRef = useRef<HTMLDivElement>();
    const { close, open, opened } = controller;

    useEffect(() => {
        if(modalRef.current instanceof HTMLElement) {
            if(opened) {
                modalRef.current.style.zIndex = "999";
                modalRef.current.style.display = "flex";
                modalRef.current.classList.add("open");
            } else {
                modalRef.current.classList.remove("open");
                window.setTimeout(() => {
                    if(modalRef.current) {
                        modalRef.current.style.zIndex = "-1";
                        modalRef.current.style.display = "none";
                    }
                }, 250)
            }
        }
    }, [opened, modalRef]);
    return (
        <div ref={modalRef as any} {...props} className={`Modal ${props.className || ""}`} >
            <div className="Modal-Container">
                <div className="Modal-Header">
                    <div className="Modal-Header-Content">
                        {header}
                    </div>
                    <button onClick={close} className="Modal-Close">
                        <CloseIcon />
                    </button>
                </div>
                <div className="Modal-Body">
                    {children}
                </div>
                <div className="Modal-Footer">
                    {footer}
                </div>
            </div>
        </div>
    )
}