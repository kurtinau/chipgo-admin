import { combineReducers } from 'redux';
import categoriesReducer from "./Categories";
import productsReducer from "./Products";

const CatalogReducer = combineReducers({
    categories: categoriesReducer,
    products: productsReducer
});

export default CatalogReducer;
