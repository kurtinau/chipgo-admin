import { combineReducers } from 'redux';
import CatalogReducer from "./Catalog";
import ApiReducer from "./Api";

const appReducer = combineReducers({
    catalog : CatalogReducer,
    api: ApiReducer,
});

export default appReducer;
