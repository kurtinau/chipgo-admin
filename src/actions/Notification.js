import {toast} from "react-toastify";
import {FAILURE, HIDE_MODAL, INFO, SHOW_MODAL, SUCCESS, WARNING} from "../constants/Notification";

export const showModal = (obj) => {
    return {type: SHOW_MODAL, payload: obj}
};

export const hideModal = () => {
    return {type: HIDE_MODAL}
};

export const showToast = (obj) => {
    const content = obj.content;
    const type = obj.type;
    switch (type) {
        case SUCCESS:
            toast.success(content);
            break;
        case FAILURE:
            toast.error(content);
            break;
        case INFO:
            toast.info(content);
            break;
        case WARNING:
            toast.warn(content);
            break;
        default:
            toast(content);
    }
    return {type: ''}
};