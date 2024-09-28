import { Layout, Media } from "../comps";
import { useMainContext } from "../states";

const HomePage = () => {

    return (
        <Layout>
        </Layout>
    )
};

export default HomePage;

export { default as BuilderPage } from "./builder";
export { default as StartPage } from "./start";
export { default as LoginPage } from "./login";
export { default as MediaPage } from "./media";
export { default as Page404 } from "./404";
export { default as Page403 } from "./403";
export { default as ModelsPage } from "./models";
export { default as PreviewPage } from "./models/preview";
export { default as NewModelPage } from "./models/new";
export { default as DomainsPage } from "./domains";
export { default as DomainsFormPage } from "./domains/form";
export { default as PagesPage } from "./pages";
export { default as PagesForm } from "./pages/form";
export { default as ProfilePage } from "./profile";
export { default as UsersPage } from "./users";
export { default as UsersForm } from "./users/form";