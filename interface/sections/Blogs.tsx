import { ListField, ModelField, StringField, useBuilderContext } from "../builder";
import { BuilderComp, BuilderMedia, WC, WCList } from "../builder/types";
import { Link, MediaComp } from "../comps";

interface Blog {
    title: string;
    category: string;
    image: BuilderMedia;
    date: string;
    page: {
        link: string;
    }
}

interface Props {
    title: WC<string>;
    blogs: WCList<Blog>;
}

const props = {
    title: StringField({ default: "My Blog" }),
    blogs: ListField({
        props: ModelField({ model: "blogs", query: "{ title category date image { public_id width height } page { link } }" }),
        default: new Array(2).fill({
            title: "Blog Title",
            category: "Category",
            date: new Date().toString(),
        }) as Blog[]
    })
}

function formatDate(dateString) {
    const date = new Date(dateString);

    return new Intl.DateTimeFormat('en-US', { year: "numeric", month: "long", day: "numeric" }).format(date);
}

const Blogs = ({ blogs, title, ...props } : Props) => {
    const { c } = useBuilderContext();

    return (
        <>
  {/* blog */}
<div {...c(props)} id="blog" className="blog segments">
    <div className="container">
      <div className="section-title">
        <h3 {...c(title)}>{title[0]}</h3>
      </div>
      <div {...c(blogs)} className="row">
        {blogs[0].map((blog, index) => (
            <div key={index} {...c(blog)} className="col-md-6">
                <div className="content">
                    <div className="image">
                        {!blog.image && <img src="images/blog1.jpg" alt="" />}
                        {blog.image && <MediaComp.comp media={blog.image} width={600} />}
                    </div>
                    <div className="blog-title">
                        <h4>
                            <Link href={blog.page.link}>
                                {blog.title}
                            </Link>
                        </h4>
                        <div className="date">
                            {formatDate(blog.date)} <i className="fas fa-circle" />{" "}
                            <a href="">
                                <span>{blog.category}</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  </div>
  {/* end blog */}
</>

    )
}

export const BlogComp : BuilderComp = {
    comp: Blogs,
    name: "Blogs",
    props
}