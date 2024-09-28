import { Dispatch, ReactNode, useEffect, useRef } from "react";
import { CloseIcon } from "../icons";
import { useBuilderContext } from "../states";

interface BuilderModalProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    children: ReactNode;
    header: ReactNode;
    footer: ReactNode;
    controller: [Boolean, Function];
}

const BuilderModal = ({ header, footer, children, controller, ...props } : BuilderModalProps) => {
    const context = useBuilderContext();
    const modalRef = useRef<HTMLDivElement>();
    const [open, setOpen] = controller;

    useEffect(() => {
        if(modalRef.current instanceof HTMLElement) {
            if(open) {
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
    }, [open, modalRef.current]);

    return (
        <div ref={modalRef as any} {...props} className={`__Builder-Modal ${props.className || ""}`} >
            <div className="__Builder-Modal-Container">
                <div className="__Builder-Modal-Header">
                    <div className="__Builder-Modal-Header-Content">
                        {header}
                    </div>
                    <button onClick={() => setOpen(false)} className="__Builder-Modal-Close">
                        <CloseIcon />
                    </button>
                </div>
                <div className="__Builder-Modal-Body">
                    {children}
                </div>
                <div className="__Builder-Modal-Footer">
                    {footer}
                </div>
            </div>
        </div>
    )
}

export default BuilderModal;