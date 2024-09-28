import { ReactNode } from "react";
import { useMainContext } from "../states";

interface Props extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    title: string;
    items: {
        name: string;
        link?: string;
    }[];
    children?: ReactNode;
}

export default ({ title, items, children, ...props } : Props) => {
    const { controller: { router: { navigate } } } = useMainContext();

    return (
        <div {...props} className={`app-breadcrumps ${props.className || ""}`}>
            <div className="breadcrumps-left">
                <h1 className="app-heading">{title}</h1>
                <ul className="breadcrumps-list">
                    {items.map((item, index) => (
                        <li className="breadcrumps-item" onClick={() => item.link && navigate(item.link)}  key={index}>
                            {item.name}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="breadcrumps-right">
                {children}
            </div>     
        </div>
    )
}