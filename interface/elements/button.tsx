import { StringField, useBuilderContext } from "../builder";
import { BuilderComp, WC } from "../builder/types";
import { Link } from "../comps";

export interface ButtonProps {
    title: WC<string>;
    href: WC<string>;
}

const props = {
    title: StringField({ default: "Learn More" }),
    href: StringField({ default: "#" })
}

const Button = ({ href, title, ...props } : ButtonProps) => 
{
    const { c } = useBuilderContext();

    return (
        <button {...c(props)} className="button">
            <Link {...c(title)} href={href[0]}>
                {title[0]}
            </Link>
        </button>
    )
}

export const ButtonComp : BuilderComp = {
    name: "button",
    comp: Button,
    props
}