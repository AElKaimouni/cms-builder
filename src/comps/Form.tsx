import { ReactNode } from "react";
import { FormActions, useForm } from "../utils";

type FormProps = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;

interface Props extends FormProps {
    controller: ReturnType<typeof useForm>;
    sumbit: ReactNode;
}

export default ({ controller, sumbit, ...props } : Props) => {
    const {data, errors, set , inputs} = controller;

    return (
        <form {...props}>
            <table>
                {inputs.map((input, index) => {
                    const prop = input.name;
                    const id = `${prop}_label`;

                    return (
                        <tr key={index} className="form-group">
                            <td>{input.label && <label htmlFor={id}>{input.label}</label>}</td>
                            <td>
                                {(() => {
                                    switch(input.type) {
                                        case "select": return (
                                            <select id={id} onChange={e => set({ type: FormActions.SET, prop, value: e.target.value })}>
                                                {input.placeholder && <option selected disabled>{input.placeholder}</option>}
                                                {input.values && input.values.map(value => (
                                                    <option key={value} value={value} selected={value === data[prop]}>{value}</option>
                                                ))}
                                            </select>
                                        );
                                        default: return (
                                            <input className="app-input" id={id} {...input}
                                                onChange={e => set({ type: FormActions.SET, prop, value: e.target.value })}
                                                value={data[prop]}
                                            />
                                        )
                                    }
                                })()}
                                {errors[prop] && <div className="from-error">{errors[prop]}</div>}
                            </td>
                        </tr>
                    )
                })}
                <tr className="form-group">
                    <td></td>
                    <td>{sumbit}</td>
                </tr>
            </table>
        </form>
    )
}