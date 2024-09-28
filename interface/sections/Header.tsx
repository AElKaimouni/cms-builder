import { ListField, StringField, useBuilderContext } from "../builder";
import { BuilderComp, WC, WCList } from "../builder/types";
import { Link, MediaComp, mediaProps, MediaProps } from "../comps";

interface Props {
    logo: WC<string>;
    links: WCList<{
        title: WC<string>;
        href: WC<string>;
    }>;
    small_title: WC<string>;
    huge_title: WC<string>;
    button: {
        title: WC<string>;
        href: WC<string>;
    };
    image: MediaProps;
}

const props = {
    logo: StringField({ type: "short", default: "BLEAK" }),
    links: ListField({
        props: {
            title: StringField({ type: "short", default: "New Link" }),
            href: StringField({ type: "short", default: "#" })
        },
        default: [
            { title: "Home", href: "#" },
            { title: "About", href: "#" },
            { title: "Contact", href: "#" }
        ]
    }),
    small_title: StringField({ type: "short", default: "I AM BLEAK PEAKER" }),
    huge_title: StringField({ type: "short", default: "Graphic Designer" }),
    button: {
        title: StringField({ type: "short", default: "Hire Me" }),
        href: StringField({ default: "#" })
    },
    image: mediaProps(null)
}

const Header = ({ button, huge_title, image, links, logo, small_title, ...props } : Props) => {
    const { c } = useBuilderContext();

    return (
<>
  {/* header */}
  <header {...c(props)} id="home">
    {/* navbar */}
    <div className="container">
      <nav className="navbar navbar-expand-lg navbar-dark">
        {/* navbar brand or logo */}
        <a href="#" className="navbar-brand">
          <h2 {...c(logo)}>{logo[0]}</h2>
        </a>
        {/* end navbar brand or logo */}
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarTogglerDemo"
          aria-controls="navbarTogglerDemo"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div id="navbarTogglerDemo" className="collapse navbar-collapse">
          <ul {...c(links)} className="navbar-nav ml-auto">
            {links[0].map((link, index) => (
                <li {...c(link)} key={index} className="nav-item active">
                    <a {...c(link.title, link)} href={link.href[0]} className="nav-link">
                        {link.title[0]}
                    </a>
                </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
    {/* end navbar */}
    {/* home intro */}
    <div className="home-intro segments">
      <div className="container">
        <div className="intro-content box-content">
          <div className="row justify-content-center">
            <div className="col-md-8 col-sm-12 col-xs-12">
              <div className="intro-caption">
                <span {...c(small_title)}>{small_title[0]}</span>
                <h2 {...c(huge_title)}>{huge_title[0]}</h2>
                <button className="button">
                    <Link {...c(button.title)} href={button.href[0]}>
                        {button.title[0]}
                    </Link>
                </button>
              </div>
            </div>
            <div className="col-md-4 col-sm-12 col-xs-12">
              <div className="intro-image">
                {!image.media.public_id && <img {...c(image.media)} src="/images/intro-image.png" alt="" />}
                {image.media.public_id && <MediaComp.comp {...image} width={400} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    {/* end home intro */}
  </header>
  {/* end header */}
</>

    )
}

export const HeaderComp: BuilderComp = {
    name: "Header",
    comp: Header,
    props
}