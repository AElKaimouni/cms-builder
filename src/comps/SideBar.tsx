import { useMainContext } from "../states";
import { SideBar, SideBarGroup, SideBars } from "../types";

interface SideBarItemProps {
    bar: SideBar;
}

const SideBarItem = ({ bar } : SideBarItemProps) => {
    const { controller, layout } = useMainContext();

    return (

        <>
            {!bar.blank && <>
                <div
                    className={`sidebar-item ${layout.activeBar === bar.link ? "active" : ""}`}
                    onClick={() => controller.router.navigate(bar.link)}
                >
                    {bar.icon} {bar.title}
                </div>
            </>}
            {bar.blank && <>
                <a
                    className={`sidebar-item ${layout.activeBar === bar.link ? "active" : ""}`}
                    href={bar.link} target="_blank"
                >
                    {bar.icon} {bar.title}
                </a>
            </>}
        </>
    )
}

interface BarsProps {
    bars: SideBars;
}

const Bars = ({ bars } : BarsProps) => {
    return (
        <li className="app-sidebars">
            {bars.map(bar => {
                const isGroup = Array.isArray((bar as any).bars);

                if(isGroup) return (
                    <div key={(bar as SideBarGroup).name} className="sidebar-group">
                        {(bar as SideBarGroup).name && <div className="side-bar-group-name">
                            {(bar as SideBarGroup).icon} {(bar as SideBarGroup).name}
                        </div>}
                        <div className="sidebar-group-list">
                            {(bar as SideBarGroup).bars.map(bar => (
                                <SideBarItem key={bar.title} bar={bar} />
                            ))}
                        </div>
                    </div>
                ); else return (
                    <SideBarItem key={(bar as SideBar).title} bar={bar as SideBar} />
                )
            })}
        </li>
    )
};

interface Props {

}

export default ({  } : Props) => {
    const { layout } = useMainContext();

    return (
        <div id="side-bar">
            <ul id="side-bar-up">
                <Bars bars={layout.sidebars.up} />
            </ul>
            <ul id="side-bar-down">
                <Bars bars={layout.sidebars.down} />
            </ul>
        </div>
    )
}