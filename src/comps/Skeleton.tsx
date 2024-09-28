import Skeleton from "react-loading-skeleton";

interface Props extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    count?: number;
    height?: number;
}

export default ({ height, ...props } : Props) => {
    return <Skeleton containerClassName={"app-skeleton"} style={{ height: `calc(18px + ${height || 1} * 1.25em)`, width: "100%", borderRadius: "0", ...props.style }} {...props} />
}