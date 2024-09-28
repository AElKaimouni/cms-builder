import { FormEvent, useEffect } from "react";
import { UsersAPi } from "../APIs";
import { Form, Layout, Loader } from "../comps";
import { useMainContext } from "../states";
import { FormActions, useForm, useLoader } from "../utils";
import { cpasswordValidator, emailValidator, passwordValidator, usernameValidator } from "../utils/validators";
 
export default () => {
    const formController = useForm(inputs);
    const { controller } = useMainContext();
    const { data, isValid, setErrors } = formController;
    const [loading, loadingController] = useLoader();

    const onSubmit = (e: FormEvent<HTMLFormElement>) => loadingController.process(async () => {
        e.preventDefault();
        const result = await UsersAPi.registerUser({
            name: data.username,
            email: data.email,
            password: data.password
        });

        if(result.error) setErrors({ type: FormActions.SET, prop: result.error.field, value: result.error.error });

        if(result.status) controller.loading.process(async () => {
            await controller.status.refetch();
            if(result.token) await controller.users.authToken(result.token);
            controller.router.navigate("/");
        })
    })

    return (
        <Layout type="form">
            <h1>Create the frist user</h1>
            <Form controller={formController} onSubmit={onSubmit} sumbit={(
                <button disabled={loading || !isValid} type="submit">{!loading ? "Create" : <Loader inline />}</button>
            )} />
        </Layout>
    )
}

const inputs = [
    {
        name: "username",
        label: "Username",
        placeholder: "Username",
        type: "text",
        validator: usernameValidator,
        required: true
    },
    {
        name: "email",
        label: "Email",
        placeholder: "Email",
        type: "email",
        validator: emailValidator,
        required: true
    },
    {
        name: "password",
        label: "Password",
        placeholder: "Password",
        type: "password",
        validator: passwordValidator,
        required: true
    },
    {
        name: "cpassword",
        label: "Confirm Password",
        placeholder: "Confirm Password",
        type: "password",
        validator: cpasswordValidator,
        required: true
    },
]