import { CompField, ListField, StringField, useBuilderContext } from "../builder";
import DyanmicZone from "../builder/comps/DyanmicZone";
import { BuilderComp, WC, WCD, WCList } from "../builder/types";
import { Link, mediaProps, MediaProps } from "../comps";
import { ButtonComp, ButtonProps } from "../elements/button";
import { resizeMedia } from "../helpers";

interface SmallTitleProps {
    text: WC<string>;
}
interface HugeTitleProps {
    text: WC<string>;
}
interface DescriptionProps {
    text: WC<string>;
}


interface Props {
    content: WCList<
        WCD<SmallTitleProps, "small_title"> |
        WCD<HugeTitleProps, "huge_title"> |
        WCD<DescriptionProps, "description"> |
        WCD<ButtonProps, "button">
    >;
    image: MediaProps;
}

const props = {
    content: ListField({
        dynamic: true,
        props: {
            small_title: {
                text: StringField({ default: "About Me" })
            },
            huge_title: {
                text: StringField({ default: "I am a Graphic Designer" })
            },
            description: {
                text: StringField({ type:"styled", default: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ut doloremque ratione perferendis possimus voluptatibus distinctio autem expedita qui unde modi impedit officia illum praesentium amet, vero quos natus veritatis totam!" })
            },
            [ButtonComp.name]: CompField({ comp: ButtonComp.name })
        },
        default: [
            { __comp: "small_title", text: "About Me" },
            { __comp: "huge_title", text: "I am a Graphic Designer" },
            { __comp: "button", title: "new button" }
        ]
    }),
    image: mediaProps(null)
}

const About = ({ content, image, ...props } : Props) => {
    const { c } = useBuilderContext();

    return (
        <>
{/* about */}
  <div {...c(props)} id="about" className="about segments">
    <div className="container">
      <div className="box-content">
        <div className="row">
          <div className="col-md-6 col-sm-12 col-xs-12">
            <div {...c(content)} className="content-left">
                <DyanmicZone data={content} custom={{
                    small_title: ({ text, ...props } : SmallTitleProps) => (
                        <div {...c(props)} className="section-title section-title-left">
                            <h3 {...c(text, props)}>{text[0]}</h3>
                        </div>
                    ),
                    huge_title: ({ text, ...props } : HugeTitleProps) => (
                        <div {...c(props)} className="content">
                            <h2 {...c(text, props)}>{text[0]}</h2>
                        </div>
                    ),
                    description: ({ text, ...props }: DescriptionProps) => (
                        <div {...c(props)} className="content">
                            <p {...c(text, props)} dangerouslySetInnerHTML={{ __html: text[0] }}>
                  
                            </p>
                        </div>
                    )
                }} />
            </div>
          </div>
          <div className="col-md-6 col-sm-12 col-xs-12">
            <div {...c(image.media)} style={{ backgroundImage: image.media.public_id ? `url(${resizeMedia(image.media, 600)})` : undefined }} className="content-right" />
          </div>
        </div>
      </div>
    </div>
  </div>
  {/* end about */}
</>

    )
}

export const AboutComp2 : BuilderComp = {
    name: "About2",
    comp: About,
    props
}