import { ReactNode } from "react";
import { DotsIcon, useSwitch } from "../utils";

interface Props extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    actions: ({
        name: string;
        callBack: () => void;
        disabled?: boolean
    } | "line")[];
    children?: ReactNode;
}

export default ({ actions, children, ...props } : Props) => {
    const [state, _switch] = useSwitch();

    return (
        <div  className="app-dropmenu">
            <button {...props} onClick={_switch} className={"app-button icon " + (props.className || "")}>
                {children || <DotsIcon />}
            </button>
            <div className="app-menu" style={{ display: state ? "block": "none" }}>
                {actions.map((action, index) => {
                    if(action === "line") return <div className="dropdown-line"></div>

                    return (
                        <div onClick={() => { if(!action.disabled) {action.callBack(); _switch();} }} className={`app-menu-item ${action.disabled ? "disabled" : ""}`} key={index}>
                            {action.name}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}