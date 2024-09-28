import { Dispatch } from "react";

interface PanigrationProps {
    pageController: [number, Dispatch<number>];
    pagesCount: number;
}

const createPages = (count: number) => {
    const pages : number[] = [];

    for(let i  = 0; i < count; i++) pages.push(i);
    
    return pages;

}

const Panigrations = ({ pageController, pagesCount } : PanigrationProps) => {
    const [activePage, setActivePage] = pageController;
    
    
    return (
        <ul className="__Builder-Panigration">
            {createPages(pagesCount).map(page => (
                <li key={page} className={page === activePage ? "active" : ""} onClick={() => setActivePage(page)}>{page}</li>
            ))}
        </ul>
    )
}

export default Panigrations;