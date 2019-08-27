const indicatorReducer = (state = {}, action) => {
    const { type } = action;
    const matches = /(.*)_(SUCCESS|FAILURE)/.exec(type);

    // not a *_REQUEST / *_SUCCESS /  *_FAILURE actions, so we ignore them
    if (!matches) return state;

    const [, requestName, requestState] = matches;
    return {
        ...state,
        // Store whether a request is happening at the moment or not
        // e.g. will be true when receiving GET_TODOS_SUCCESS
        //      and false when receiving GET_TODOS_FAILURE
        [requestName]: requestState === 'SUCCESS',
    };
};

export default indicatorReducer;