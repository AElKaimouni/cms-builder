import { StringField, useBuilderContext } from "../builder";
import { BuilderComp, WC } from "../builder/types";

interface Props {
    copyrights: WC<string>;
}

const props = {
    copyrights: StringField({ type: "styled", default: "Copyright © All Right Reserved" })
}

const Footer = ({ copyrights, ...props } : Props) => {
    const { c } = useBuilderContext();

    return (
<>
    <div {...c(props)} className="footer segments">
        <div className="container">
            <div className="box-content">
                <p {...c(copyrights)} dangerouslySetInnerHTML={{ __html: copyrights[0] }}></p>
            </div>
        </div>
    </div>
</>

    )
}

export const FooterComp : BuilderComp =  {
    name: "Footer",
    props: props,
    comp: Footer
}