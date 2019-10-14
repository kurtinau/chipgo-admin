import React from 'react';
import DefaultLayout from './containers/DefaultLayout';
// import EditProduct from "./components/Catalog/Products/EditProduct";

const Dashboard = React.lazy(() => import('./components/Dashboard'));
//---------------------------------------------------------------------------------------------------
// const Categories = React.lazy(() => import('./components/Catalog/Categories'));
const Categories = React.lazy(() => import('./containers/Categories'));
const Products = React.lazy(() => import('./containers/Products'));
const AddProduct = React.lazy(() => import('./components/Catalog/Products/AddProduct'));
// const AddProduct = React.lazy(() => import('./containers/Products/AddProduct'));
// const EditProduct = React.lazy(() => import('./containers/Products/EditProduct'));
const EditProduct = React.lazy(() => import('./components/Catalog/Products/EditProduct'));
//---------------------------------------------------------------------------------------------------

// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
    {path: '/', exact: true, name: 'Home', component: DefaultLayout},
    {path: '/dashboard', name: 'Dashboard', component: Dashboard},
    //---------------------------------------------------------------------------------------------------
    {path: '/catalog', exact: true, name: 'Catalog', component: Categories},
    {path: '/catalog/categories', exact: true, name: 'Categories', component: Categories},
    {path: '/catalog/products', exact: true, name: 'Products', component: Products},
    {path: '/catalog/products/add', exact: true, name: 'Add', component: AddProduct},
    {path: '/catalog/products/edit/:id', exact: true, name: 'Edit', component: EditProduct},
    //---------------------------------------------------------------------------------------------------

];

export default routes;
