import { FormEvent, useEffect } from "react";
import { AppError, Form, Layout, Loader } from "../comps"
import { useMainContext } from "../states";
import { useError, useForm, useLoader } from "../utils"

export default () => {
    const fromController = useForm(inputs);
    const formErrorController = useError();
    const [loading, loadingController] = useLoader();
    const { controller, user } = useMainContext();

    const onSubmit = (e: FormEvent<HTMLFormElement>) => loadingController.process(async () => {
        e.preventDefault();
        const { data, formController } = fromController;
        const result = await controller.users.login({
            name: data.login,
            password: data.password
        });

        if(!result){
            formController.clearProp("password");
            formErrorController.set("Unvalid credentials");
        }
    });

    useEffect(() => { if(user) controller.router.navigate("/") }, [user])

    return (
        <Layout type="form">
            <h1 className="app-heading">Login</h1>
            <AppError controller={formErrorController} />
            <Form controller={fromController} onSubmit={onSubmit} sumbit={(
                <button className="app-button primary" disabled={loading} type="submit">
                    {loading ? <Loader button /> : "Login"}
                </button>
            )} />
        </Layout>
    )
}

const inputs = [
    {
        name: "login",
        placeholder: "Login",
        label: "Login",
        type: "text"
    },
    {
        name: "password",
        placeholder: "Password",
        label: "Password",
        type: "password"
    }
];