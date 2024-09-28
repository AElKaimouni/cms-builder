import { useEffect, useMemo, useRef } from "react";
import { ListField, ModelField, StringField, useBuilderContext } from "../builder";
import { BuilderComp, BuilderMedia, WC, WCList } from "../builder/types";
import { MediaComp, MediaProps } from "../comps";
import { resizeMedia } from "../helpers";

interface Portfolio {
    title: string;
    key: string;
    categorie: string;
    image: BuilderMedia;
}

interface Props {
    title: WC<string>;
    portfolios: WCList<Portfolio>;
}

const props = {
    title: StringField({ default: "My Portfolio" }),
    portfolios: ListField({
        props: ModelField({ model: "portfolio", query: "{ title image { public_id width height } key categorie }" }),
        default: new Array(3).fill({
            title: "My Portfolio",
            categorie: "Flowers",
            key: "Graphic Design"
        }) as Portfolio[]
    })
}

const Portfolio = ({ portfolios, title, ...props } : Props) => {
    const { c } = useBuilderContext();
    const groups = useMemo(() => {
        return [...new Set(portfolios[0].map(portfolio => portfolio.categorie))];
    }, [portfolios]);
    const ref = useRef<HTMLElement>();
    const rd = Math.random().toString().replace(".", "0")

    useEffect(() => {
        if(ref.current instanceof HTMLElement) {
            // porfolio filterizr
            $(ref.current).find('.' + rd).imagesLoaded( function() {
                const element = $(ref.current).find('.' + rd);
                if(element[0] instanceof HTMLElement) {
                    element.filterizr();
                }
            });

            // portfolio filter
            $(ref.current).find('.portfolio-filter-menu li').on('click', function() {
                $(ref.current).find('.portfolio-filter-menu li').removeClass('active');
                $(this).addClass('active');
            });

            // portfolio magnific popup
            $(ref.current).each(function() { // the containers for all your galleries
                $(this).magnificPopup({
                    delegate: '.portfolio-popup', // the selector for portfolio item
                    type: 'image',
                    gallery: {
                        enabled: true
                    }
                });
            });
        }

    }, [groups, ref])

    return (
<>
  {/* portfolio */}
  <div ref={ref as any} {...c(props)} id="portfolio" className="portfolio segments">
    <div className="container">
      <div className="box-content">
        <div className="section-title">
          <h3 {...c(title)}>{title[0]}</h3>
        </div>
        <div className="portfolio-filter-menu">
          <ul>
             <li  data-filter="all" className="active">
                <span>See All</span>
            </li>
            {groups.map(group => (
                <li key={group} data-filter={groups.indexOf(group) + 1}>
                    <span>{group}</span>
                </li>
            ))}
          </ul>
        </div>
        <div {...c(portfolios)} className={`row no-gutters ${rd}`}>
            {portfolios[0].map((portfolio, index) => (
                <div {...c(portfolio)} key={index}
                    className="col-md-4 col-sm-12 col-xs-12 filtr-item"
                    data-category={groups.indexOf(portfolio.categorie) + 1}
                    >
                    <div className="content-image">
                        <a href={portfolio.image ? resizeMedia(portfolio.image, 1200) : "/images/portfolio1.jpg"} className="portfolio-popup">
                            {!portfolio.image && <img src="images/portfolio1.jpg" alt="" />}
                            {portfolio.image && <MediaComp.comp media={portfolio.image} width={500} />}
                            <div className="image-overlay" />
                            <div className="portfolio-caption">
                                <div className="title" style={{ display: "block" }}>
                                    <h4>{portfolio.title}</h4>
                                </div>
                                <div className="subtitle">
                                    <span>{portfolio.key}</span>
                                </div>
                            </div>
                        </a>
                    </div>
                </div>
            ))}
            
        </div>
      </div>
    </div>
  </div>
  {/* end portfolio */}
</>

    )
};

export const PortfolioComp : BuilderComp = {
    name: "Portfolio",
    comp: Portfolio,
    props
}