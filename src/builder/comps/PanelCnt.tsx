import { ReactNode } from "react"

interface PanelCntProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    children: ReactNode;
    active: boolean;
}

const PanelCnt = ({ children, active, ...props } : PanelCntProps) => {
    return (
        <div {...props} className={`__Builder-Panel-Cnt ${props.className || ""}`} style={active ? props.style : { ...props.style, display: "none" }}>
            {children}
        </div>
    )
}

export default PanelCnt;