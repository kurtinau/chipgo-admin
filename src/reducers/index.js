import {combineReducers} from 'redux';
import {connectRouter} from 'connected-react-router'
import CatalogReducer from "./Catalog";
import ApiReducer from "./Api";
import NotificationReducer from "./Notification";

const createRootReducer = (history) => combineReducers({
    router: connectRouter(history),
    catalog: CatalogReducer,
    api: ApiReducer,
    notification: NotificationReducer,
});

export default createRootReducer;
