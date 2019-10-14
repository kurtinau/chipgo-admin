import {
    ADD_PRODUCT_FAIL,
    ADD_PRODUCT_REQUEST, ADD_PRODUCT_SUCCESS, DELETE_DESCRIPTION_FILES_FAIL, DELETE_DESCRIPTION_FILES_SUCCESS,
    UPDATE_PRODUCT_DESCRIPTION_REQUEST,
    UPDATE_PRODUCT_FAIL, UPDATE_PRODUCT_REQUEST,
    UPDATE_PRODUCT_SUCCESS,
    UPLOAD_PRODUCT_DESCRIPTION_IMAGES_FAIL,
    UPLOAD_PRODUCT_DESCRIPTION_IMAGES_SUCCESS, UPLOAD_PRODUCT_FILES_FAIL,
    UPLOAD_PRODUCT_FILES_SUCCESS
} from "../constants/Products";
import API, {descriptionImageURL, hostName, imageURL} from "../config/Api";
import {cloneDeep, difference, isEmpty, isUndefined} from "lodash";
import axios from "axios";
import {put, takeEvery, all, fork, call, takeLatest, select} from 'redux-saga/effects';
import {push} from 'connected-react-router';
import {getDescriptionByid} from "../selectors/Catalog/Products";
import {func} from "prop-types";

/**
 * url: /products/id
 * data: {fieldname: fieldvalue}
 * @param config
 * @returns {Promise<T | {error: any}>}
 */
export function updateProductApi(config) {
    return API.put(config.url, {
        data: config.data
    }).then(res => {
        const response = res.data.response;
        return {response};
    }).catch(error => (
        {error}
    ));
};

export function addProductApi(config) {
    return API.post(config.url, {
        data: config.data
    }).then(function (res) {
        const response = res.data.response;
        return {response};
    }).catch(error => (
        {error}
    ));
}

export function callAPIDeleteFile(deletedPaths) {
    return API.delete('/1/images', {data: deletedPaths})
        .then(function (response) {
            return {response}
        }).catch(function (error) {
            return {error};
        });
}

function uploadImage(files, url) {
    let formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return axios.post(url, formData, {
        headers:
            {
                'content-type':
                    'multipart/form-data'
            }
    });
}


function* handleProductDesImgDelete(originalEntityMapFiles, editedRemoteFilePaths) {
    console.log('handle des img delete');

    let deletedPaths = difference(originalEntityMapFiles, editedRemoteFilePaths);
    deletedPaths = deletedPaths.map(path => path.slice(hostName.length));
    console.log('deleted-desc: ', deletedPaths);
    yield call(callAPIDeleteFile, deletedPaths)
}

export function* handleProductDesImgUpload(objUrls, newDescription, imageIndexs) {
    let descFiles = [];
    for (let i = 0; i < objUrls.length; i++) {
        const file = yield call(objURL2file, objUrls[i]);
        descFiles.push(file);
    }
    console.log('res:: ', descFiles);

    console.log('handle des img upload');
    const res = yield uploadImage(descFiles, descriptionImageURL).then(res => {
        const response = res.data.response;
        console.log('saga-res: ', response);
        return {response};
    }).catch(error => ({error}));

    if (res.response) {
        console.log('resData: ', res.response);
        imageIndexs.forEach((value, index) => {
            newDescription.entityMap[value].data.src = res.response[index].path;
        });
        console.log('new-description:: ', newDescription);
        objUrls.forEach(url => URL.revokeObjectURL(url));
    }
    return res;
}

export function handleProductImgUpload(files, id) {
    console.log('handle img upload');
    // const files = product.description.files;
    return uploadImage(files, imageURL + '/' + id).then(res => {
        const response = res.data.response;
        console.log('saga-img-res: ', response);
        return {response};
    }).catch(error => ({error}));
}

////todo edit product description
/**
 * Edit product
 * @param action {type: UPDATE_PRODUCT_REQUEST, payload: product}
 * @returns {IterableIterator<PutEffect<{payload: *, type: string}>|PutEffect<{payload: {data: *}, type: string}>|CallEffect|PutEffect<{type: string}>>}
 */
function* handleProductDesUpdate(action) {
    //1. if remote image is deleted, dispatch API.delete to delete server image file
    //2. if add new image, dispatch API.post to upload new image to server
    const config = action.payload;
    const product = config.data;
    console.log('saga-prod: ', product);
    const originalDescription = product.originalDescription;
    const editedDescription = product.description;
    const files = editedDescription.files;

    //--------------------1. check whether remote files have been deleted --------------
    const originalEntityMapFiles = [];
    Object.values(originalDescription.entityMap).forEach(value => originalEntityMapFiles.push(value.data.src));
    const editedRemoteFilePaths = Object.values(editedDescription.remoteFiles);
    console.log('orig::: ', originalEntityMapFiles);
    console.log('editsss: ', editedRemoteFilePaths);
    //---------------------2. check if files array is empty
    try {
        if (originalEntityMapFiles.length !== editedRemoteFilePaths.length) {
            //remote files have been deleted
            yield call(handleProductDesImgDelete, originalEntityMapFiles, editedRemoteFilePaths);
            yield put({type: 'DELETE_DESCRIPTION_FILE_SUCCESS'});
        }
        if (!isEmpty(files)) {
            //upload new images
            const resData = yield call(handleProductDesImgUpload, Object.values(product.description.files));
            console.log('resData: ', resData);
            console.log('handle-prod: ', product);
            const localFilesIndex = Object.keys(files);
            localFilesIndex.forEach((value, index) => {
                product.description.raw.entityMap[value].data.src = resData[index].path;
            });
            console.log('after-up: ', product);
        }
    } catch (e) {

    } finally {
        //create a new product obj
        // const newProduct = set('description', product.description.raw, product);
        // delete newProduct.originalDescription;
        // console.log('new-product: ', newProduct);
        console.log('saga-after-prod: ', product);
        delete product.originalDescription;
        product.description = product.description.raw;
        const newProduct = cloneDeep(product);
        config.data = newProduct;
        Object.values(product.description.entityMap).forEach(value => value.data.src = hostName.concat(value.data.src));

        //remove hostname from image url
        Object.values(newProduct.description.entityMap).forEach(value => {
            if (value.data.src.startsWith('http')) {
                value.data.src = value.data.src.slice(hostName.length);
            }
        });
        const {response, error} = yield call(updateProductApi, config);
        console.log('resssadsfsadf: ', response);
        if (response)
            yield put({type: UPDATE_PRODUCT_SUCCESS, payload: {data: response}});
        else
            yield put({type: UPDATE_PRODUCT_FAIL, payload: error});
    }
}

/**
 * Update product
 * 1. check if the description of product has been changed,
 *
 * 1.1 if description has been changed
 * 1.1.1 check if the images of description have been changed
 * 1.1.1.1 check if new images have been added (use url startsWith('blob:'), if yes, upload new images to server
 * 1.1.1.2 check if images have been deleted, if yes, delete images from server
 *
 * 1.2 if description hasn't been changed, call update api to update product
 *
 * @param action {type: UPDATE_PRODUCT_REQUEST, payload: product}
 * @returns {IterableIterator<*>}
 */
export function* handleProductUpdate(action) {
    let editedProduct = action.payload;
    const id = editedProduct.id;
    const originalDescription = yield select(getDescriptionByid, editedProduct.id);
    console.log('saga-update-product-description: ', editedProduct.description);
    console.log('saga-update-product-original-description: ', originalDescription);
    let config = {url: '/products/' + id};
    let errorFlag = false;
    let desImgUploadRes = {};
    // 1. check if the description of product has been changed
    if (!isUndefined(editedProduct.description)) {
        editedProduct = cloneDeep(editedProduct);
        //if original description is empty, then just upload all new images
        if (isEmpty(originalDescription)) {
            const addNewDescriptionRes = yield call(handleAddNewDescription, editedProduct.description);
            if (addNewDescriptionRes.error) {
                yield put({type: UPLOAD_PRODUCT_DESCRIPTION_IMAGES_FAIL});
                errorFlag = true;
            }else if(addNewDescriptionRes.response){
                yield put({type: UPLOAD_PRODUCT_DESCRIPTION_IMAGES_SUCCESS});
            }
        } else {
            //1.1 if description has been changed
            //1.1.1 check if the images of description have been changed
            const editedDescription = editedProduct.description;
            //get all images entities (type===IMAGE)
            let originalImages = [];
            Object.values(originalDescription.entityMap).forEach(entity => {
                const url = entity.data.src;
                if (entity.type === 'IMAGE' && url.startsWith(hostName)) {
                    originalImages.push(url);
                }
            });
            let editedImages = [], editedImagesIndex = [], newImages = [], newImagesIndex = [];
            Object.values(editedDescription.entityMap).forEach((entity, index) => {
                if (entity.type === 'IMAGE') {
                    const url = entity.data.src;
                    if (url.startsWith(hostName)) {
                        editedImages.push(url);
                        editedImagesIndex.push(index);
                    }
                    if (url.startsWith('blob:')) {
                        newImages.push(url);
                        newImagesIndex.push(index);
                    }
                }
            });
            //1.1.1.1 check if new images have been added (use url startsWith('blob:'), if yes, upload new images to server
            if (!isEmpty(newImages)) {
                //upload new images to server
                console.log('update-product-sagas::: upload new images');
                desImgUploadRes = yield call(handleProductDesImgUpload, newImages, editedDescription, newImagesIndex);
                console.log('update-product-sagas upload description res::', desImgUploadRes);
                if (desImgUploadRes.response) {
                    yield put({type: UPLOAD_PRODUCT_DESCRIPTION_IMAGES_SUCCESS});
                } else {
                    console.error(desImgUploadRes.error);
                    yield put({type: UPLOAD_PRODUCT_DESCRIPTION_IMAGES_FAIL});
                    yield put({type: UPDATE_PRODUCT_FAIL});
                    errorFlag = true;
                }
            }

            if (!errorFlag) {
                //1.1.1.2 check if images have been deleted, if yes, delete images from server
                const differenceBEditedAndOriginal = difference(originalImages, editedImages);
                if (!isEmpty(differenceBEditedAndOriginal)) {
                    // delete images from server
                    const pathNeed2Delete = differenceBEditedAndOriginal.map(value => value.substr(hostName.length));
                    const deleteFileRes = yield call(callAPIDeleteFile, pathNeed2Delete);
                    if (deleteFileRes.error) {
                        yield put({type: DELETE_DESCRIPTION_FILES_FAIL});
                        console.error(deleteFileRes.error);
                        errorFlag = true;
                    } else {
                        yield put({type: DELETE_DESCRIPTION_FILES_SUCCESS});
                    }
                }
                //before update, need remove hostName of images' url
                editedImagesIndex.forEach(value => {
                    const trimUrl = editedDescription.entityMap[value].data.src;
                    editedDescription.entityMap[value].data.src = trimUrl.substr(hostName.length);
                });
            }
        }
    }
    if (!errorFlag) {
        //1.2 description hasn't been changed, call update api to update product
        config.data = editedProduct;
        const {response, error} = yield call(updateProductApi, config);
        console.log('Delete old images');
        if (response) {
            yield put({type: UPDATE_PRODUCT_SUCCESS, payload: response});
        } else {
            yield put({type: UPDATE_PRODUCT_FAIL});
            console.error(error);
            //update product error, need delete images that uploaded before
            if (!isEmpty(desImgUploadRes)) {
                const pathNeed2Delete = desImgUploadRes.response.map(value => value.path);
                const deleteFileRes = yield call(callAPIDeleteFile, pathNeed2Delete);
                if (deleteFileRes.error) {
                    yield put({type: DELETE_DESCRIPTION_FILES_FAIL});
                    console.error(deleteFileRes.error);
                }
            }
        }
    }else{
        yield put({type: UPDATE_PRODUCT_FAIL});
    }
}

/**
 * Add new product
 * 1. insert into new product with base info(name, price, etc)
 * 2. get new product id from response data
 * 3. upload description images and update product description field
 * 4. upload product files(server will update product file_path field automatically)
 * @param action
 * @returns {IterableIterator<CallEffect|PutEffect<{type: string}>>}
 */
export function* handleProductAdd(action) {
    const product = action.payload;
    let newProduct = cloneDeep(product);
    if (newProduct.hasOwnProperty('files'))
        delete newProduct.files;

    //1.insert new product data first
    const config = {url: '/products', data: newProduct};
    const {description, files} = product;
    const {response, error} = yield call(addProductApi, config);
    console.log('resssadsfsadf: ', response);
    if (response) {
        //insert new product success

        //2. get new product id from response data
        const id = response[0].id;

        //3.upload description images and update product description field
        if (!isUndefined(description)) {
            let newDescription = cloneDeep(description);

            const addNewDescriptionRes = yield call(handleAddNewDescription, newDescription);
            if (addNewDescriptionRes.response) {
                //3.1 update product description field
                const updateProductRes = yield call(updateProductApi, {
                    url: config.url + '/' + id,
                    data: {description: newDescription}
                });
                if (updateProductRes.response) {
                    //upload description images success
                    yield put({type: UPLOAD_PRODUCT_DESCRIPTION_IMAGES_SUCCESS});
                } else {
                    //upload description images fail, need delete images which is uploaded before
                    let pathNeed2Delete = [];
                    ////todo
                    addNewDescriptionRes.response.forEach(value => pathNeed2Delete.push(value.path));
                    console.log('path need to delete: ', pathNeed2Delete);
                    const deleteFileRes = yield call(callAPIDeleteFile, pathNeed2Delete);
                    if (deleteFileRes.error) {
                        yield put({type: DELETE_DESCRIPTION_FILES_FAIL});
                        console.error(deleteFileRes.error);
                    }
                    yield put({type: UPLOAD_PRODUCT_DESCRIPTION_IMAGES_FAIL});
                }
            } else if(addNewDescriptionRes.error){
                yield put({type: UPLOAD_PRODUCT_DESCRIPTION_IMAGES_FAIL});
            }


            // let descFileObjUrls = []; //images from local and waiting to upload
            // //check if description contains images
            // const entityMap = description.entityMap;
            // if (!isEmpty(entityMap)) {
            //     //check if entityMap includes images(from local only) or not
            //     const entities = Object.values(description.entityMap);
            //     let imageIndexs = [];
            //     entities.forEach((entity, index) => {
            //         if (entity.type === 'IMAGE') {
            //             if (entity.data.src.startsWith('blob:')) {
            //                 descFileObjUrls.push(entity.data.src);
            //                 imageIndexs.push(index);
            //             }
            //         }
            //     });
            //     console.log('des files: ', descFileObjUrls);
            //     if (!isEmpty(descFileObjUrls)) {
            //         //found images from local, upload it to server
            //
            //         const desImgUploadRes = yield call(handleProductDesImgUpload, descFileObjUrls);
            //         if (desImgUploadRes.response) {
            //             console.log('resData: ', desImgUploadRes.response);
            //             console.log('handle-prod: ', product);
            //             imageIndexs.forEach((value, index) => {
            //                 newDescription.entityMap[value].data.src = desImgUploadRes.response[index].path;
            //             });
            //             console.log('new-description:: ', newDescription);
            //             // //3.1 update product description field
            //             // const updateProductRes = yield call(updateProductApi, {
            //             //     url: config.url + '/' + id,
            //             //     data: {description: newDescription}
            //             // });
            //             // if (updateProductRes.response) {
            //             //     //upload description images success
            //             //     yield put({type: UPLOAD_PRODUCT_DESCRIPTION_IMAGES_SUCCESS});
            //             //     //revoke description object url
            //             //     descFileObjUrls.forEach(url => URL.revokeObjectURL(url));
            //             // } else {
            //             //     //upload description images fail, need delete images which is uploaded before
            //             //     let pathNeed2Delete = [];
            //             //     desImgUploadRes.response.forEach(value => pathNeed2Delete.push(value.path));
            //             //     console.log('path need to delete: ', pathNeed2Delete);
            //             //     const deleteFileRes = yield call(callAPIDeleteFile, pathNeed2Delete);
            //             //     if (deleteFileRes.error) {
            //             //         yield put({type: DELETE_DESCRIPTION_FILES_FAIL});
            //             //         console.error(deleteFileRes.error);
            //             //     }
            //             //     yield put({type: UPLOAD_PRODUCT_DESCRIPTION_IMAGES_FAIL});
            //             // }
            //         } else {
            //             yield put({type: UPLOAD_PRODUCT_DESCRIPTION_IMAGES_FAIL});
            //         }
            //     }
            //
            // }
        }

        let files2upload = [];
        if (!isUndefined(files)) {
            //upload product images
            console.log('new product has files');
            for (let i = 0; i < files.length; i++) {
                const file = yield call(objURL2file, files[i].url);
                files2upload.push(file);
            }
            console.log('prodocut files:  ', files2upload);
            const uploadResponse = yield call(handleProductImgUpload, files2upload, id);
            if (uploadResponse.response) {
                console.log('image uploaded: ', uploadResponse.response);
                //revoke product object url
                files.forEach(file => URL.revokeObjectURL(file.url));
                yield put({type: UPLOAD_PRODUCT_FILES_SUCCESS});
            } else {
                yield put({type: UPLOAD_PRODUCT_FILES_FAIL});
            }
        }
        yield put({type: ADD_PRODUCT_SUCCESS, payload: {data: response}});
        //after adding product success, redirect to editing page.
        yield put(push('/catalog/products/edit/' + id));
    } else
        yield put({type: ADD_PRODUCT_FAIL, payload: error});


}

export function* handleAddNewDescription(newDescription) {
    let descFileObjUrls = []; //images from local and waiting to upload
    //check if description contains images
    const entityMap = newDescription.entityMap;
    if (!isEmpty(entityMap)) {
        //check if entityMap includes images(from local only) or not
        const entities = Object.values(entityMap);
        let imageIndexs = [];
        entities.forEach((entity, index) => {
            if (entity.type === 'IMAGE') {
                if (entity.data.src.startsWith('blob:')) {
                    descFileObjUrls.push(entity.data.src);
                    imageIndexs.push(index);
                }
            }
        });
        console.log('des files: ', descFileObjUrls);
        if (!isEmpty(descFileObjUrls)) {
            //found images from local, upload it to server
            const desImgUploadRes = yield call(handleProductDesImgUpload, descFileObjUrls, newDescription, imageIndexs);
            return desImgUploadRes;
        } else {
            return {};
        }
    } else {
        return {};
    }
}


export function objURL2file(url) {
    return axios.get(url, {
        responseType: 'blob'
    }).then(response => {
        if (response) {
            console.log('blob res: ', response);
            return new File([response.data], '' + Date.now(), {
                type: response.data.type,
                lastModified: Date.now(),
                size: response.data.size
            });
        }
    }).catch(error => error);
}


export function* watchProductAdd() {
    yield takeLatest(ADD_PRODUCT_REQUEST, handleProductAdd);
}

export function* watchProductUpdate() {
    yield takeLatest(UPDATE_PRODUCT_REQUEST, handleProductUpdate);
}

export default function* productSaga() {
    yield all([
        call(watchProductUpdate),
        call(watchProductAdd),
    ])
}