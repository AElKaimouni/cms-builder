import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useMainContext } from "./states";
import HomePage, { BuilderPage, StartPage, LoginPage, MediaPage, Page404, ModelsPage, PreviewPage, NewModelPage, DomainsPage, DomainsFormPage, PagesPage, PagesForm, ProfilePage, UsersPage, UsersForm } from "./pages";
import { PageProvider, PageRoute } from "./comps";
import { useEffect } from "react";
import { MainContextObject, UserRole } from "./types";
import { checkModelPerms } from "./utils";

declare global {
    interface Window {
        __main_context: MainContextObject;
    }
}

const App = () => {
    const context = useMainContext();

    useEffect(() => {
        window.__main_context = context
    })

    return (
        <Routes>
            {PageRoute({ Page: StartPage, path: "/start" })}
            {PageRoute({ Page: LoginPage, path: "/login" })}

            {PageRoute({ Page: UsersForm, path: "/users/form/:id", auth: user =>  checkModelPerms(user, "users", 1), protectedRoute: true })}
            {PageRoute({ Page: UsersForm, path: "/users/form", auth: user =>  checkModelPerms(user, "users", 0), protectedRoute: true })}
            {PageRoute({ Page: UsersPage, path: "/users", auth: user =>  checkModelPerms(user, "users", 1), protectedRoute: true })}

            {PageRoute({ Page: ProfilePage, path: "/profile", protectedRoute: true })}

            {PageRoute({ Page: NewModelPage, path: "/models/new/:model", auth: (user, params) =>  checkModelPerms(user, params.model, 0), protectedRoute: true })}
            {PageRoute({ Page: NewModelPage, path: "/models/new/:model/:id", auth: (user, params) =>  checkModelPerms(user, params.model, 1), protectedRoute: true, })}
            {PageRoute({ Page: PreviewPage, path: "/models/preview/:model", auth: (user, params) =>  checkModelPerms(user, params.model, 1), protectedRoute: true })}
            {PageRoute({ Page: ModelsPage, path: "/models", auth: (user, params) =>  checkModelPerms(user, params.model, 1), protectedRoute: true })}

            {PageRoute({ Page: PagesPage, path: "/pages", auth: user =>  checkModelPerms(user, "pages", 1), protectedRoute: true })}
            {PageRoute({ Page: PagesForm, path: "/pages/form", auth: user =>  checkModelPerms(user, "pages", 0), protectedRoute: true })}
            {PageRoute({ Page: PagesForm, path: "/pages/form/:id", auth: user =>  checkModelPerms(user, "pages", 1), protectedRoute: true })}

            {PageRoute({ Page: DomainsPage, path: "/domains", auth: user => user.role === UserRole.Developer, protectedRoute: true })}
            {PageRoute({ Page: DomainsFormPage, path: "/domains/form", auth: user => user.role === UserRole.Developer, protectedRoute: true })}
            {PageRoute({ Page: DomainsFormPage, path: "/domains/form/:id", auth: user => user.role === UserRole.Developer, protectedRoute: true })}

            {PageRoute({ Page: MediaPage, path: "/media", auth: user => checkModelPerms(user, "media", 1), protectedRoute: true })}
            
            {PageRoute({ Page: BuilderPage, path: "/builder", auth: user => checkModelPerms(user, "pages", 1), protectedRoute: true })}

            {PageRoute({ Page: HomePage, path: "/", protectedRoute: true })}

            {PageRoute({ Page: Page404, path: "*" })}
        </Routes>
    )
}

export default App;