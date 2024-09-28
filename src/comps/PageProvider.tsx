import { ReactNode, useEffect } from "react"
import { useMainContext } from "../states";
import { Loader } from ".";
import { PathRouteProps, Route, useParams } from "react-router-dom";
import { User, UserPerms, UserRole } from "../types";
import Page403 from "../pages/403";

interface Props  {
    Page: () => JSX.Element;
    protectedRoute?: boolean;
    auth?: (user: User, params: {[key: string] : string}) => boolean
}

interface RouteProps extends Props, Omit<PathRouteProps, "element"> {}

export const PageRoute = ({ Page, protectedRoute, auth, ...props } : RouteProps) => {
    return <Route {...props} element={<PageProvider Page={Page} auth={auth} protectedRoute={protectedRoute} />} />
}

export const PageProvider =  ({ Page, protectedRoute, auth, ...props } : Props) => {
    const params = useParams();
    const { user, status, loading, controller } = useMainContext();
    const authenticated = !protectedRoute || Boolean(user);
    const authorized = !auth || (user && user?.role < UserRole.Admin) || (user && auth(user, params as any));

    if(!loading && !authenticated) controller.router.navigate("/login");
    if(!loading && !authorized) return <Page403 />;

    return (
        <div id="page-root">
            {loading && <Loader screen />}
            {!loading && authenticated && <Page />}
        </div>
    )

}

export default PageProvider;