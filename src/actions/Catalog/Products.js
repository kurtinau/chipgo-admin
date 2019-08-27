import {callAPIDelete, callApiGet, callAPIPost, callAPIPut} from "../Api/api";
import {
    ADD_PRODUCT_FAILURE,
    ADD_PRODUCT_REQUEST,
    ADD_PRODUCT_SUCCESS,
    DELETE_DESCRIPTION_FILES_FAILURE, DELETE_DESCRIPTION_FILES_REQUEST,
    DELETE_PRODUCTS_FILES_FAILURE,
    DELETE_PRODUCTS_FILES_REQUEST,
    DELETE_PRODUCTS_FILES_SUCCESS,
    GET_PRODUCTS_FAILURE,
    GET_PRODUCTS_REQUEST,
    GET_PRODUCTS_SUCCESS,
    SET_DESCRIPTION,
    SET_FILES, UPDATE_PRODUCT_DESCRIPTION_REQUEST,
    UPDATE_PRODUCT_FAILURE,
    UPDATE_PRODUCT_REQUEST,
    UPDATE_PRODUCT_SUCCESS
} from "../../constants/Products";
import axios from "axios";
import API, {hostName, descriptionImageURL} from "../../config/Api";
import {difference, isEmpty, isEqual, isUndefined} from "lodash";
import {flow, set} from "lodash/fp";

function uploadImage(files) {
    try {
        let formData = new FormData();// instantiate it
        // suppose you have your file ready
        // formData.set('file', yourFile)
        files.forEach(file => formData.append('files', file));
        const response = axios.post(descriptionImageURL, formData, {
            headers:
                {
                    'content-type':
                        'multipart/form-data' // do not forget this
                }
        });
        console.log(response);
        return response;
    } catch (error) {
        console.error(error);
    }
}

// function deleteImage(files) {
//
//     API.delete(config.url)
//         .then(function (response) {
//             // console.log('hello-delete   ',response);
//             const data = resObj;
//             dispatch(successCB(data));
//             console.log('delete success', data);
//         }).catch(function (error) {
//         console.log('zaasnsdfsdfsd', error);
//         dispatch(errorCB(error));
//     });
//
//     try {
//         let formData = new FormData();// instantiate it
//         // suppose you have your file ready
//         // formData.set('file', yourFile)
//         files.forEach(file => formData.append('files', file));
//         const response = axios.post(descriptionImageURL, formData, {
//             headers:
//                 {
//                     'content-type':
//                         'multipart/form-data' // do not forget this
//                 }
//         });
//         console.log(response);
//         return response;
//     } catch (error) {
//         console.error(error);
//     }
// }

export const addProduct = (product) => {
    return dispatch => {
        console.log(product);
        let newFile_path = [];
        product.file_path.forEach(path => newFile_path.push(hostName + path));
        let newProduct = {
            ...product,
            description: {...product.description},
            file_path: newFile_path.toString(),
        };
        const files = product.description.files;
        if (!isEmpty(files)) {
            const descriptionRawData = {
                blocks: [...product.description.raw.blocks],
                entityMap: {...product.description.raw.entityMap},
            };
            newProduct.description = descriptionRawData;
            uploadImage(Object.values(files)).then(response => {
                if (response) {
                    const resData = response.data.response;
                    console.log('res: ', resData);
                    const entityMapObj = newProduct.description.entityMap;
                    const entityMapKeys = Object.keys(entityMapObj);
                    console.log(entityMapKeys.length);
                    entityMapKeys.forEach((key, index) => {
                        entityMapObj[key].data.src = resData[index].path;
                    });
                    console.log('new: ', newProduct);
                    const config = {
                        url: '/products',
                        data: newProduct
                    };
                    dispatch(callAPIPost(config, addProductRequest, addProductSuccess, addProductFail));
                } else {
                    console.log('error');
                }
            });
        } else {
            const config = {
                url: '/products',
                data: newProduct
            };
            dispatch(callAPIPost(config, addProductRequest, addProductSuccess, addProductFail));
        }
    }
};

function addProductSuccess(data) {
    return {type: ADD_PRODUCT_SUCCESS, payload: {data}}
}

function addProductFail(error) {
    return {type: ADD_PRODUCT_FAILURE, payload: error};
}

function addProductRequest() {
    return {type: ADD_PRODUCT_REQUEST}
}


export const fetchProducts = () => {
    return dispatch => {
        const config = {url: '/products'};
        dispatch(callApiGet(config, getProductsRequest, getProductsSuccess, getProductsFail));
    }
};

function getProductsRequest() {
    return {type: GET_PRODUCTS_REQUEST}
}

function getProductsSuccess(data) {
    return {type: GET_PRODUCTS_SUCCESS, payload: {data}}
}

function getProductsFail(error) {
    return {type: GET_PRODUCTS_FAILURE, payload: error};
}


export const fetchProductByid = (id) => {
    return dispatch => {
        const config = {url: '/products/' + id};
        dispatch(callApiGet(config, getProductsRequest, getProductsSuccess, getProductsFail));
    }
};

export const deleteProductFiles = (name, id, successFn) => {
    console.log('ansdfs: ', name);
    console.log('ansdfs: ', id);
    return dispatch => {
        const config = {url: '/0/images/' + name + '/' + id};
        dispatch(callAPIDelete(config, deleteProductFilesRequest, deleteProductFilesSuccess, deleteProductFilesFail, {}, successFn));
    }
};

function deleteProductFilesRequest() {
    return {type: DELETE_PRODUCTS_FILES_REQUEST}
}

function deleteProductFilesSuccess(data) {
    return {type: DELETE_PRODUCTS_FILES_SUCCESS, payload: {data}}
}

function deleteProductFilesFail(error) {
    return {type: DELETE_PRODUCTS_FILES_FAILURE, payload: error};
}


export const editProduct = (product) => {
    return dispatch => {
        let config = {
            url: '/products/' + product.id,
            data: product
        };
        // let errorFlag = false;
        if (!isUndefined(product.description)) {
            //description has been edited, need to deal with image uploading or deleting
            dispatch({type: UPDATE_PRODUCT_DESCRIPTION_REQUEST, payload: config});
            // const originalDescription = product.originalDescription;
            // const editedDescription = product.description;
            // //if files array is not empty, then need to upload new images
            // const files = editedDescription.files;
            // if (!isEmpty(files)) {
            //     //upload new images
            //     uploadImage(Object.values(files)).then(response => {
            //         if (response) {
            //             const resData = response.data.response;
            //             console.log('res: ', resData);
            //             const localFilesIndex = Object.keys(files);
            //             localFilesIndex.forEach((value, index) => {
            //                 // editedDescription.raw.entityMap[value].data.src = hostName.concat(resData[index].path);
            //                 editedDescription.raw.entityMap[value].data.src = resData[index].path;
            //             });
            //         } else {
            //             console.error('Upload image to description error!');
            //             errorFlag = true;
            //         }
            //     });
            // }
            // console.log(errorFlag);
            // if (!errorFlag) {
            //     //check whether remote files have been deleted
            //     const originalEntityMapFiles = [];
            //     Object.values(originalDescription.entityMap).forEach(value => originalEntityMapFiles.push(value.data.src));
            //     const editedRemoteFilePaths = Object.values(editedDescription.remoteFiles);
            //     console.log('orig::: ', originalEntityMapFiles);
            //     console.log('editsss: ', editedRemoteFilePaths);
            //     if (originalEntityMapFiles.length !== editedRemoteFilePaths.length) {
            //         //remote files have been deleted
            //         let deletedPaths = difference(originalEntityMapFiles, editedRemoteFilePaths);
            //         deletedPaths = deletedPaths.map(path => path.slice(hostName.length));
            //         console.log('deleted-desc: ', deletedPaths);
            //         API.delete('/1/images', {data: deletedPaths})
            //             .then(function (response) {
            //             }).catch(function (error) {
            //             errorFlag = true;
            //             console.error(error);
            //         });
            //         if (!errorFlag) {
            //             ////todo refactor code
            //             const newProduct = set('description', product.description.raw, product);
            //             delete newProduct.originalDescription;
            //             config.data = newProduct;
            //             Object.values(newProduct.description.entityMap).forEach(value => {
            //                 value.data.src = value.data.src.slice(hostName.length);
            //             });
            //             dispatch(callAPIPut(config, updateProductRequest, updateProductSuccess, updateProductFail));
            //         }
            //     } else {
            //         //remote files have not been deleted
            //         ////todo refactor code
            //         const newProduct = set('description', product.description.raw, product);
            //         delete newProduct.originalDescription;
            //         config.data = newProduct;
            //         console.log('newPro: ', newProduct);
            //         Object.values(newProduct.description.entityMap).forEach(value => {
            //             console.log('value::: ', value);
            //             value.data.src = value.data.src.slice(hostName.length);
            //         });
            //         dispatch(callAPIPut(config, updateProductRequest, updateProductSuccess, updateProductFail));
            //     }
            // } else {
            //     dispatch(updateProductFail('error'));
            // }
            // console.log('result-descr: ', editedDescription);
        } else {
            dispatch(callAPIPut(config, updateProductRequest, updateProductSuccess, updateProductFail));
        }
        console.log('pro-data: ',config.data);

        // dispatch(callAPIPut(config, updateProductRequest, updateProductSuccess, updateProductFail));
    }
};

function deleteDescriptionFilesSuccess(data) {

}

function deleteDescriptionFilesFail(error) {
    return {type: DELETE_DESCRIPTION_FILES_FAILURE, payload: error};
}

function deleteDescriptionFilesRequest() {
    return {type: DELETE_DESCRIPTION_FILES_REQUEST}
}

export function updateProductSuccess(data) {
    return {type: UPDATE_PRODUCT_SUCCESS, payload: {data}}
}

export function updateProductFail(error) {
    return {type: UPDATE_PRODUCT_FAILURE, payload: error};
}

export function updateProductRequest() {
    return {type: UPDATE_PRODUCT_REQUEST}
}

export function setDescription(description) {
    return {type: SET_DESCRIPTION, payload: description}
}

export function setFiles(files) {
    return {type: SET_FILES, payload: files}
}