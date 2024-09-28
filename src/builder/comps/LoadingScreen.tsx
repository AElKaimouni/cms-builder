import { useEffect } from "react";
import BuilderLoading from "./Loading";

interface ScreenLoadingProps {
    loading: boolean;
}

const ScreenLoading = ({ loading } : ScreenLoadingProps) => {
    return (
        <div className={`__Builder-Loading-Screen ${loading ? "__Builder-Active" : ""}`}>
            <BuilderLoading screen />
        </div>
    )
}

export default ScreenLoading;