import { combineReducers } from 'redux';
import CatalogReducer from "./Catalog";
import ApiReducer from "./Api";
import NotificationReducer from "./Notification";

const appReducer = combineReducers({
    catalog : CatalogReducer,
    api: ApiReducer,
    notification: NotificationReducer,
});

export default appReducer;
