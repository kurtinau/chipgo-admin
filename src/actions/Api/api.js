import API from "../../config/Api";

export const callApiGet = (config, requestCB, successCB, errorCB) => {
    return dispatch => {
        dispatch(requestCB);
        API.get(config.url)
            .then(function (response) {
                console.log(response);
                const data = response.data.response;
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

export const callAPIDelete = (config, requestCB, successCB, errorCB, node) => {
    return dispatch => {
        dispatch(requestCB);
        API.delete(config.url)
            .then(function (response) {
                // console.log('hello-delete   ',response);
                const data = node;
                dispatch(successCB(data));
                console.log('delete success', data);
            }).catch(function (error) {
            console.log('zaasnsdfsdfsd',error);
            dispatch(errorCB(error));
        });
    }
};