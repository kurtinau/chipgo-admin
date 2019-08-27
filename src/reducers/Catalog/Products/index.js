import {
    ADD_PRODUCT_SUCCESS,
    GET_PRODUCTS_SUCCESS,
    SET_DESCRIPTION,
    SET_FILES,
    UPDATE_PRODUCT_SUCCESS
} from "../../../constants/Products";
import {flow, set} from 'lodash/fp';

const initialState = {
    byIds: {},
    allIds: [],
    description: {},
    files: [],
};

function productsReducer(state = initialState, action) {
    switch (action.type) {
        case SET_DESCRIPTION:
            return {
                byIds: {...state.byIds},
                allIds: [...state.allIds],
                files: [...state.files],
                description: action.payload,
            };
        case SET_FILES:
            return {
                byIds: {...state.byIds},
                allIds: [...state.allIds],
                description: {...state.description},
                files: action.payload,
            };
        case ADD_PRODUCT_SUCCESS:
            return {};
        case GET_PRODUCTS_SUCCESS:
            let newByIds = {};
            let newAllIds = [];
            let responseData = [...action.payload.data];
            console.log('zas: ', responseData);
            responseData.forEach(data => {
                let copyData = Object.assign({}, data);
                newByIds[copyData.id] = copyData;
                newAllIds.push(copyData.id);
            });
            return flow(
                set('byIds', newByIds),
                set('allIds', newAllIds),
            )(state);
        case UPDATE_PRODUCT_SUCCESS:
            const updatedData = action.payload.data[0];
            console.log('update:: ', updatedData);
            return set('byIds.' + updatedData.id, updatedData, state);
        default:
            return state;
    }
}


export default productsReducer;