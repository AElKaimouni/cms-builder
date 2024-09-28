import { useState } from "react";
import { Modal } from "../../comps";
import { useModal } from "../../utils";

export interface ConfirmModalInfo {
    title: string;
    confirm: string;
    cancel: string;
    type: string;
    message: string;
};

export const useConfirmModal = () => {
    const modalController = useModal();
    const [info, setInfo] = useState<ConfirmModalInfo | null>(null);

    return {
        modalController, info, setInfo,
        open: (info?: ConfirmModalInfo) => {
            if(info) setInfo(info);
            modalController.open();

            return new Promise(success => {
                const confirmButton = document.getElementById("confirm-modal-confirm");
                const cancelButton = document.getElementById("confirm-modal-cancel");
                const closeButton = document.querySelector("#confirm-modal .Modal-Close");

                if(confirmButton instanceof HTMLElement && cancelButton instanceof HTMLElement && closeButton instanceof HTMLElement) {
                    const confirmHandler = () => {
                        clear();
                        success(true);
                    };
                    const cancelHandler = () => {
                        clear();
                        success(false);
                    };
                    const clear = () => {
                        modalController.close();
                        confirmButton.removeEventListener("click", confirmHandler);
                        cancelButton.removeEventListener("click", cancelHandler);
                        closeButton.removeEventListener("click", cancelHandler);
                    }

                    confirmButton.addEventListener("click", confirmHandler);
                    cancelButton.addEventListener("click", cancelHandler);
                    closeButton.addEventListener("click", cancelHandler);
                } else throw new Error("Cannot find confirm modal buttons.")
            });
        },
        close: modalController.close
    };
}

interface Props {
    controller: ReturnType<typeof useConfirmModal>;
}

export default ({ controller } : Props) => {
    const { modalController, info } = controller;

    return (
        <Modal id="confirm-modal" controller={modalController} footer={(
            <>
                <button id="confirm-modal-cancel" className="app-button">{info?.cancel}</button>
                <button id="confirm-modal-confirm" className={`app-button ${info?.type}`}>{info?.confirm}</button>
            </>
        )} header={info?.title}>
            {info?.message}
        </Modal>
    )
};