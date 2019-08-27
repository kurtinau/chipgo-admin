import {put, takeEvery, all, fork, call, takeLatest} from 'redux-saga/effects'
import {showModal, showToast} from "../actions/Notification";
import {
    UPDATE_PRODUCT_DESCRIPTION_REQUEST,
    UPDATE_PRODUCT_FAILURE,
    UPDATE_PRODUCT_SUCCESS
} from "../constants/Products";
import {cloneDeep, difference, isEmpty} from "lodash";
import API, {hostName} from "../config/Api";
import {set} from "lodash/fp";
import {callAPIDelete, callAPIDeleteFile, callAPIPut, uploadImage} from "../actions/Api/api";
import {updateProductFail, updateProductRequest, updateProductSuccess} from "../actions/Catalog/Products";


// function* categoryFetch() {
//     try {
//         yield put({type: API_REQUEST});
//         const data = yield call(fetchCategories, 'categories');
//         console.log('hello from the other side');
//         // console.log(data);
//         yield put({type: API_SUCCESS, payload: data});
//     } catch (error) {
//         console.log('errorrr');
//         yield put({
//             type: API_FAILURE, error: true, payload: new Error(), isLoading: false,
//             meta: {
//                 errorMsg: error
//             }
//         })
//     }
// }
//
// function* watchCategoryFetch() {
//     yield takeEvery(FETCH_CATEGORY_LIST, categoryFetch);
// }


function* showNotification(action) {
    // const regex = /_/g;
    // const content = action.type.replace(regex,' ').toLowerCase().concat('!!!');
    // const title = action.type.split('_')[0].toLowerCase().concat('?');
    // const obj = {title: title, content: content};
    // yield put(showModal(obj));

    const strArr = action.type.split('_');
    const toastType = strArr[strArr.length - 1];
    const regex = /_/g;
    const content = action.type.replace(regex, ' ').toLowerCase().concat('!!!');

    yield put(showToast({type: toastType, content: content}));
}

function* watchUpdateSuccess() {
    yield takeEvery(action => /(UPDATE)_(.*)_(SUCCESS)/.exec(action.type), showNotification);
}

function* watchUpdateFail() {
    yield takeEvery(action => /(UPDATE)_(.*)_(FAILURE)/.exec(action.type), showNotification);
}

function* watchDeleteSuccess() {
    yield takeEvery(action => /(DELETE)_(.*)_(SUCCESS)/.exec(action.type), showNotification);
}

function* watchDeleteFail() {
    yield takeEvery(action => /(DELETE)_(.*)_(FAILURE)/.exec(action.type), showNotification);
}

function* watchProductUpdate() {
    yield takeLatest(UPDATE_PRODUCT_DESCRIPTION_REQUEST, handleProductDesUpdate);
}

function updateProductApi(config) {
    return API.put(config.url, {
        data: config.data
    }).then(res => {
        const response = res.data.response;
        return {response};
    }).catch(error => (
        {error}
    ));
};

function* handleProductDesImgDelete(originalEntityMapFiles, editedRemoteFilePaths) {
    console.log('handle des img delete');

    let deletedPaths = difference(originalEntityMapFiles, editedRemoteFilePaths);
    deletedPaths = deletedPaths.map(path => path.slice(hostName.length));
    console.log('deleted-desc: ', deletedPaths);
    yield call(callAPIDeleteFile, deletedPaths)
}

function handleProductDesImgUpload(product) {
    console.log('handle des img upload');
    const files = product.description.files;
    return uploadImage(Object.values(files)).then(response => {
        if (response) {
            const resData = response.data.response;
            console.log('saga-res: ', resData);
            return resData;
        }
    }).catch(error => {
        return error;
    });
}

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
            const resData = yield call(handleProductDesImgUpload, product);
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
            if(value.data.src.startsWith('http')){
                value.data.src = value.data.src.slice(hostName.length);
            }
        });
        const {response, error} = yield call(updateProductApi, config);
        console.log('resssadsfsadf: ', response);
        if (response)
            yield put({type: UPDATE_PRODUCT_SUCCESS, payload: {data: response}});
        else
            yield put({type: UPDATE_PRODUCT_FAILURE, payload: error});
    }
}


export default function* rootSaga() {
    yield all([
        call(watchUpdateSuccess),
        call(watchUpdateFail),
        call(watchDeleteSuccess),
        call(watchDeleteFail),
        call(watchProductUpdate),
    ])
}
