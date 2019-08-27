import {isUndefined} from "lodash";
import {HIDE_MODAL, SHOW_MODAL} from "../../constants/Notification";


const initialState = {
    isOpen: false,
    title: '',
    content: '',
    type: 'modal',
    className: 'modal-info',
};

// const initialState = {
//     modals: [],
// };

const NotificationReducer = (state = initialState, action) => {
    switch (action.type) {
        case SHOW_MODAL:
            // const newModal = {
            //     isOpen : true,
            //
            // };
            // return {
            //     ...state,
            //     modals: state.modals.concat(action.payload),
            // };
            return {
                ...state,
                isOpen: true,
                title: action.payload.title,
                content: action.payload.content,
                onConfirm: action.payload.onConfirm,
                type: isUndefined(action.payload.type) ? initialState.type : action.payload.type,
                className: isUndefined(action.payload.className) ? initialState.className : action.payload.className,
            };
        case HIDE_MODAL:
            return {...state, isOpen: false,};
        default:
            return state;
    }
};

export default NotificationReducer;