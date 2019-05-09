import {
    GET_CATEGORIES_FAILURE,
    GET_CATEGORIES_REQUEST,
    GET_CATEGORIES_SUCCESS,
    SET_NODE_EDITING,
    PUSH_TO_HISTORY,
    PUSH_TO_UNDO,
    REMOVE_UNDO_NODE,
    UPDATE_CATEGORY_SUCCESS,
    UPDATE_CATEGORY_FAILURE,
    UPDATE_CATEGORY_REQUEST, ADD_CATEGORY_SUCCESS, ADD_CATEGORY_FAILURE, ADD_CATEGORY_REQUEST,
    RESET_FAKE_DELETING,
    RESET_UN_DELETING, DELETE_CATEGORY_REQUEST, DELETE_CATEGORY_SUCCESS, DELETE_CATEGORY_FAILURE, RESET_DELETING, REST_ADDING
} from "../../constants/Categories";
import {callAPIDelete, callApiGet, callAPIPost, callAPIPut} from "../Api/api";

export const fetchCategories = () => {
    return dispatch => {
        const config = {url: '/categories'};
        dispatch(callApiGet(config, getCategoriesRequest, getCategoriesSuccess, getCategoriesFail));
    }
};

export const editCategory = (node) => {
    return dispatch => {
        const config = {
            url: '/categories/' + node.id,
            data: node
        };
        dispatch(callAPIPut(config, updateCategoryRequest, updateCategorySuccess, updateCategoryFail));
    }
};

export const addCategory = (node) => {
    return dispatch => {
        const config = {
            url: '/categories',
            data: node
        };
        dispatch(callAPIPost(config, addCategoryRequest, addCategorySuccess, addCategoryFail));
    }
};

export const deleteCategory = (node) => {
    return dispatch => {
        const config = {
            url: '/categories/' + node.id
        };
        dispatch(callAPIDelete(config, deleteCategoryRequest, deleteCategorySuccess, deleteCategoryFail, node));
    }
};

function deleteCategoryRequest() {
    return {type: DELETE_CATEGORY_REQUEST}
}

function deleteCategorySuccess(data) {
    return {type: DELETE_CATEGORY_SUCCESS, payload: {data}}
}

function deleteCategoryFail(error) {
    return {type: DELETE_CATEGORY_FAILURE, payload: error};
}

function addCategorySuccess(data) {
    return {type: ADD_CATEGORY_SUCCESS, payload: {data}}
}

function addCategoryFail(error) {
    return {type: ADD_CATEGORY_FAILURE, payload: error};
}

function addCategoryRequest() {
    return {type: ADD_CATEGORY_REQUEST}
}

function updateCategorySuccess(data) {
    return {type: UPDATE_CATEGORY_SUCCESS, payload: {data}}
}

function updateCategoryFail(error) {
    return {type: UPDATE_CATEGORY_FAILURE, payload: error};
}

function updateCategoryRequest() {
    return {type: UPDATE_CATEGORY_REQUEST}
}

function getCategoriesSuccess(data) {
    return {type: GET_CATEGORIES_SUCCESS, payload: {data}}
}

function getCategoriesFail(error) {
    return {type: GET_CATEGORIES_FAILURE, payload: error};
}

function getCategoriesRequest() {
    return {type: GET_CATEGORIES_REQUEST};
}


export function setNodeEditing(id) {
    return {type: SET_NODE_EDITING, payload: id}
}

export function push2History(node) {
    return {type: PUSH_TO_HISTORY, payload: node}
}

export function push2Undo(node) {
    return {type: PUSH_TO_UNDO, payload: node}
}

export function removeUndoNode() {
    return {type: REMOVE_UNDO_NODE}
}

export function resetFakeDeleting() {
    return {type: RESET_FAKE_DELETING}
}

export function resetUnDeleting() {
    return {type: RESET_UN_DELETING}
}

export function resetDeleting() {
    return {type: RESET_DELETING}
}

export function resetAdding() {
    return {type: REST_ADDING}
}

