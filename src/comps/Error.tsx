import { useError } from "../utils"

interface Props {
    controller : ReturnType<typeof useError>;
}

export default ({ controller: { error, set } } : Props) => {
    return (
        <>
            {error && <div className="app-error">
                {error}
            </div>}
        </>

    )
}