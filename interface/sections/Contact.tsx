import { name } from "@cloudinary/url-gen/actions/namedTransformation";
import { ListField, StringField, useBuilderContext } from "../builder";
import { BuilderComp, WC, WCList } from "../builder/types";

interface Props {
    semi_title: WC<string>;
    title: WC<string>;
    icons: WCList<WC<string>>;
    form: {
        first_name: WC<string>;
        last_name: WC<string>;
        email: WC<string>;
        subject: WC<string>;
        message: WC<string>;
        button: WC<string>;
    }
}

const props = {
    semi_title: StringField({ default: "Contact Me" }),
    title: StringField({ default: "Realize your dream with us" }),
    icons: ListField({
        props: StringField({ default: "fab fa-facebook-f" }),
        default: ["fab fa-facebook-f", "fab fa-twitter", "fab fa-dribbble", "fab fa-google"]
    }),
    form: {
        first_name: StringField({ default: "First Name" }),
        last_name: StringField({ default: "Last Name" }),
        email: StringField({ default: "Email Address" }),
        subject: StringField({ default: "Subject" }),
        message: StringField({ default: "Message" }),
        button: StringField({ default: "Send Message" }),
    }
}

const Contact = ({ form, icons, semi_title, title, ...props } : Props) => {
    const { c } = useBuilderContext();

    return (
<>
  {/* contact */}
<div {...c(props)} id="contact" className="contact segments">
    <div className="container">
      <div className="box-content">
        <div className="row">
          <div className="col-md-6 col-sm-12 col-xs-12">
            <div className="content-left">
              <div className="section-title section-title-left">
                <h3 {...c(semi_title)}>{semi_title[0]}</h3>
              </div>
              <h2 {...c(title)}>{title[0]}</h2>
              <ul {...c(icons)}>
                {icons[0].map((icon, index) => (
                    <li {...c(icon)} key={index}>
                        <a href="#">
                            <i className={icon[0]} {...c(icon)} />
                        </a>
                    </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="col-md-6 col-sm-12 col-xs-12">
            <div className="content-right">
              <form
                action="contact-form.php"
                className="contact-form"
                id="contact-form"
                method="post"
              >
                <div className="row">
                  <div className="col">
                    <div id="first-name-field">
                      <input
                        type="text"
                        {...c(form.first_name)}
                        placeholder={form.first_name[0]}
                        className="form-control"
                        name="form-name"
                      />
                    </div>
                  </div>
                  <div className="col">
                    <div id="last-name-field">
                      <input
                        type="text"
                        {...c(form.last_name)}
                        placeholder={form.last_name[0]}
                        className="form-control"
                        name="form-name"
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col">
                    <div id="email-field">
                      <input
                        type="email"
                        {...c(form.email)}
                        placeholder={form.email[0]}
                        className="form-control"
                        name="form-email"
                      />
                    </div>
                  </div>
                  <div className="col">
                    <div id="subject-field">
                      <input
                        type="text"
                        {...c(form.subject)}
                        placeholder={form.subject[0]}
                        className="form-control"
                        name="form-subject"
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col">
                    <div id="message-field">
                      <textarea
                        cols={30}
                        rows={5}
                        className="form-control"
                        id="form-message"
                        name="form-message"
                        {...c(form.message)}
                        placeholder={form.message[0]}
                        defaultValue={""}
                      />
                    </div>
                  </div>
                </div>
                <button
                  className="button"
                  type="submit"
                  id="submit"
                  name="submit"
                  {...c(form.button)}
                >
                  {form.button[0]}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  {/* end contact */}
</>

    )
}

export const ContactComp : BuilderComp = {
    name: "Contact",
    comp: Contact,
    props
}