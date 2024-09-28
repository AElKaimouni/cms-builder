interface Props {
    size?: "small" | "medium" | "large";
    button?: boolean;
    text?: string;
    screen?: boolean;
    fluid?: boolean;
}

export default ({ size, button, text, screen, fluid } : Props) => {
    const size2 = (function() {
        if(button) return "small";
        if(screen) return "large";
    })() || size || "medium";
    const text2 = (function() {
        if(button || screen || fluid) return "Loading...";
    })() || text || "";
    
    

    return (
        <div className={`app-loader ${screen ? "loader-screen" : ""} ${fluid ? "loader-fluid" : ""}`}>
            <span className={`loader ${size2}`}></span>
            {text2 && <span className="app-loader-text">{text2}</span>}
        </div>
        
    )
}