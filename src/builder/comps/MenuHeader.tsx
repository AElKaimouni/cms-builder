import { Dispatch, ReactNode } from "react";

interface MenuHeaderProps {
    spaced?: boolean;
    items: {
        name: string;
        icon: ReactNode;
        controller: [boolean, Function];
    }[];
}

const MenuHeader = ({ items, spaced } : MenuHeaderProps) => {
    return (
        <div className={`__Builder-Menu-Header ${spaced ? "__Builder-Spaced" : ""}`}>
            {items.map((item, index) => (
                <button style={{ maxWidth: `${100/items.length}%` }}
                    key={index} 
                    className={`__Builder-Menu-Header-Item ${item.controller[0] ? "__Builder-Active" : ""}`}
                    onClick={() => item.controller[1]()}
                >
                    <div>{item.name}</div>
                    {item.icon}
                </button>
            ))}
        </div>
    )
}

export default MenuHeader;