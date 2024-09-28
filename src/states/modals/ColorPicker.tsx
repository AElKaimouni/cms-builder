import { Dispatch, useEffect, useState } from "react";
import ColorPicker from "react-best-gradient-color-picker";

export const useColorPickerModal = () => {
    const [position, setPosition] = useState<[number, number] | null>(null);
    const [transform, setTransform] = useState<string>("");
    const [controller, setController] = useState<[string, Dispatch<string>] | null>(null);


    return {
        position, transform, controller, setController,
        open: ({ position, transform, controller } : {
            position?: [number, number],
            transform?: string,
            controller: [string, Dispatch<string>]
        }) => {
            setPosition(position || null);
            setTransform(transform || "");
            setController(controller);
        },
        close: () => setController(null)
    };
}

interface Props {
    controller: ReturnType<typeof useColorPickerModal>;
}

export default ({ controller } : Props) => {
    const { position, transform, setController } = controller;
    const cpController = controller.controller;

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if(e.target instanceof HTMLElement && !e.target.closest(".Custom-Color-Picker, #Custom-Color-Picker-Cnt")) {
                setController(null);
            }
        };

        window.addEventListener("click", handler);

        return () => window.removeEventListener("click", handler);
    }, []);

    return (
        <>
            {cpController && (
                <div 
                    id={`Custom-Color-Picker-Cnt`}
                    style={{ left: position?.[0] || 0, top: position?.[1] || 0, transform: transform || "none" }}
                >
                    <ColorPicker width={250} height={150} hidePresets={true} hideAdvancedSliders={true} value={cpController?.[0]} onChange={value => {
                        cpController?.[1](value);
                        setController([value, cpController?.[1]])
                    }} />
                </div>
            )}
        </>
    )
};