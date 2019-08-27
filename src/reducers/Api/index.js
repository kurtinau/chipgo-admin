import { combineReducers } from 'redux';
import errorReducer from "./Error";
import loadingReducer from "./Loading";
import indicatorReducer from "./Indicator";

const ApiReducer = combineReducers({
    error: errorReducer,
    loading: loadingReducer,
    indicator: indicatorReducer,
});

export default ApiReducer;
