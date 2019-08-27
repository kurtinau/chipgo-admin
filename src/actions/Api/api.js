import API, {descriptionImageURL} from "../../config/Api";
import axios from "axios";

export const callApiGet = (config, requestCB, successCB, errorCB) => {
    return dispatch => {
        dispatch(requestCB);
        API.get(config.url)
            .then(function (response) {
                console.log(response);
                const data = response.data.response;
                // console.log('get data: ',data);
                dispatch(successCB(data));
            }).catch(function (error) {
            console.log(error);
            dispatch(errorCB(error));
        });
    }
};

export const callAPIPost = (config, requestCB, successCB, errorCB) => {
    return dispatch => {
        dispatch(requestCB);
        API.post(config.url, {
            data: config.data
        }).then(function (response) {
            const data = response.data.response;
            console.log('post data: ', data);
            let dataWithOldId = [...data, config.data.id];
            dispatch(successCB(dataWithOldId));
        }).catch(function (error) {
            console.log(error);
            dispatch(errorCB(error));
        });
    }
};

export const callAPIPut = (config, requestCB, successCB, errorCB) => {
    return dispatch => {
        dispatch(requestCB);
        API.put(config.url, {
            data: config.data
        }).then(function (response) {
            // console.log('hello-put   ', response);
            const data = response.data.response;
            dispatch(successCB(data));
        }).catch(function (error) {
            console.log('error', error);
            dispatch(errorCB(error));
        });
    }
};

export const callAPIDelete = (config, requestCB, successCB, errorCB, resObj = {}, successFn = () => {
}) => {
    return dispatch => {
        dispatch(requestCB);
        API.delete(config.url)
            .then(function (response) {
                // console.log('hello-delete   ',response);
                const data = resObj;
                dispatch(successCB(data));
                successFn();
            }).catch(function (error) {
            dispatch(errorCB(error));
        });
    }
};

export const callAPIDeleteFile = (deletedPaths) => {
    return API.delete('/1/images', {data: deletedPaths})
        .then(function (response) {
        }).catch(function (error) {
            console.error(error);
        });
};

export const uploadImage = (files) => {
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
        return error;
    }
};