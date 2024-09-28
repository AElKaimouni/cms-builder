import { StringField, useBuilderContext } from "../builder";
import { BuilderComp, WC } from "../builder/types";
import { mediaProps, MediaProps } from "../comps";
import { resizeMedia } from "../helpers";

interface Props {
    small_title: WC<string>;
    huge_title: WC<string>;
    description: WC<string>;
    image: MediaProps;
}

const props = {
    small_title: StringField({ default: "About Me" }),
    huge_title: StringField({ default: "I am a Graphic Designer" }),
    description: StringField({ type:"styled", default: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ut doloremque ratione perferendis possimus voluptatibus distinctio autem expedita qui unde modi impedit officia illum praesentium amet, vero quos natus veritatis totam!" }),
    image: mediaProps(null)
}

const About = ({ description, huge_title, image, small_title, ...props } : Props) => {
    const { c } = useBuilderContext();

    return (
        <>
{/* about */}
  <div {...c(props)} id="about" className="about segments">
    <div className="container">
      <div className="box-content">
        <div className="row">
          <div className="col-md-6 col-sm-12 col-xs-12">
            <div className="content-left">
              <div className="section-title section-title-left">
                <h3 {...c(small_title)}>{small_title[0]}</h3>
              </div>
              <div className="content">
                <h2 {...c(huge_title)}>{huge_title[0]}</h2>
                <p {...c(description)} dangerouslySetInnerHTML={{ __html: description[0] }}>
                  
                </p>
              </div>
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

export const AboutComp : BuilderComp = {
    name: "About",
    comp: About,
    props
}