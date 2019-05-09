import { combineReducers } from 'redux';
import errorReducer from "./Error";
import loadingReducer from "./Loading";

const ApiReducer = combineReducers({
    error: errorReducer,
    loading: loadingReducer
});

export default ApiReducer;
