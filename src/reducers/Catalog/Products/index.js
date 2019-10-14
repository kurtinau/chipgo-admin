import {
    ADD_PRODUCT_SUCCESS,
    GET_PRODUCTS_SUCCESS,
    SET_DESCRIPTION,
    APPEND_FILE,
    UPDATE_PRODUCT_SUCCESS, REMOVE_FILE
} from "../../../constants/Products";
import {flow, set} from 'lodash/fp';
import {isString} from "lodash";
import {isEmpty} from "../../../util";

const initialState = {
    byIds: {},
    allIds: [],
    description: {},
    files: [],
};

function productsReducer(state = initialState, action) {
    switch (action.type) {
        case SET_DESCRIPTION:
            return set('description', action.payload, state);
        // return {
        //     byIds: {...state.byIds},
        //     allIds: [...state.allIds],
        //     files: [...state.files],
        //     description: action.payload,
        // };
        case APPEND_FILE:
            return set('files', state.files.concat(action.payload), state);
        // return {
        //     byIds: {...state.byIds},
        //     allIds: [...state.allIds],
        //     description: {...state.description},
        //     files: state.files.concat(action.payload),
        // };
        case REMOVE_FILE:
            return set('files', state.files.filter(file => file.uuid !== action.payload.uuid), state);
        case GET_PRODUCTS_SUCCESS:
            let newByIds = {};
            let newAllIds = [];
            let responseData = [...action.payload];
            console.log('zas: ', responseData);
            responseData.forEach(data => {
                let copyData = Object.assign({}, data);
                if(isString(copyData.description) && !isEmpty(copyData.description)){
                    copyData.description = JSON.parse(copyData.description);
                }
                newByIds[copyData.id] = copyData;
                newAllIds.push(copyData.id);
            });
            return flow(
                set('byIds', newByIds),
                set('allIds', newAllIds),
            )(state);
        case UPDATE_PRODUCT_SUCCESS:
            const updatedData = action.payload[0];
            console.log('update:: ', updatedData);
            if(isString(updatedData.description)&& !isEmpty(updatedData.description)){
                updatedData.description = JSON.parse(updatedData.description);
            }
            return set('byIds.' + updatedData.id, updatedData, state);
        default:
            return state;
    }
}


export default productsReducer;