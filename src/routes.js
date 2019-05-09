import React from 'react';
import DefaultLayout from './containers/DefaultLayout';

const Dashboard = React.lazy(() => import('./components/Dashboard'));
//---------------------------------------------------------------------------------------------------
// const Categories = React.lazy(() => import('./components/Catalog/Categories'));
const Categories = React.lazy(() => import('./containers/Categories'));
//---------------------------------------------------------------------------------------------------

// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
  { path: '/', exact: true, name: 'Home', component: DefaultLayout },
    { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  //---------------------------------------------------------------------------------------------------
  { path: '/catalog/categories', name: 'Categories', component: Categories},
  //---------------------------------------------------------------------------------------------------

];

export default routes;
