import { ChevLeftIcon, ChevRightIcon } from "../builder/icons";
import { usePanigration } from "../utils";

interface Props {
    count: number;
    controller: ReturnType<typeof usePanigration>;
}

export default ({ controller, count } : Props) => {
    const { canNext, canPrev, next, prev, browse, isPage } = controller;

    return (
        <div className="app-panigration">
            <button onClick={prev} disabled={!canPrev} className="app-button icon">
                <ChevLeftIcon />
            </button>
            {Array.from(Array(count).keys()).map(page => (
                <div key={page} onClick={() => browse(page)}
                    className={`app-panigration-item ${isPage(page) ? "active" : ""}`}
                >
                    {page + 1}
                </div>
            ))}
            <button onClick={next} disabled={!canNext} className="app-button icon">
                <ChevRightIcon />
            </button>
        </div>
    )
}