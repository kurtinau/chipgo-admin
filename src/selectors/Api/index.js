export const createErrorMessageSelector = actions => (state) => {
    const errors = actions.map(action => state.api.error[action]);
    if (errors && errors[0]) {
        return errors[0];
    }
    return '';
};
export const createLoadingSelector = actions => state =>
    actions.some(action => state.api.loading[action]);

export const getIndicatorSelector = (store, fieldName) => {
    return store.api.indicator[fieldName] ? store.api.indicator[fieldName] : false;
};