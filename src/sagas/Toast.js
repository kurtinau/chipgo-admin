import {showToast} from "../actions/Notification";
import {put, takeEvery, all, fork, call, takeLatest} from 'redux-saga/effects'

function* showNotification(action) {
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
    yield takeEvery(action => /(UPDATE)_(.*)_(FAIL)/.exec(action.type), showNotification);
}

function* watchDeleteSuccess() {
    yield takeEvery(action => /(DELETE)_(.*)_(SUCCESS)/.exec(action.type), showNotification);
}

function* watchDeleteFail() {
    yield takeEvery(action => /(DELETE)_(.*)_(FAIL)/.exec(action.type), showNotification);
}

function* watchUploadSuccess() {
    yield takeEvery(action => /(UPLOAD)_(.*)_(SUCCESS)/.exec(action.type), showNotification);
}

function* watchUploadFail() {
    yield takeEvery(action => /(UPLOAD)_(.*)_(FAIL)/.exec(action.type), showNotification);
}

function* watchAddSuccess() {
    yield takeEvery(action => /(ADD)_(.*)_(SUCCESS)/.exec(action.type), showNotification);
}

function* watchAddFail() {
    yield takeEvery(action => /(ADD)_(.*)_(FAIL)/.exec(action.type), showNotification);
}

export default function* toastSaga() {
    yield all([
        call(watchUpdateSuccess),
        call(watchUpdateFail),
        call(watchDeleteSuccess),
        call(watchDeleteFail),
        call(watchUploadSuccess),
        call(watchUploadFail),
        call(watchAddSuccess),
        call(watchAddFail),
    ])
}