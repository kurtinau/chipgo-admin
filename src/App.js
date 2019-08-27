// import React, { Component } from 'react';
// import { HashRouter, Route, Switch } from 'react-router-dom';
// // import { renderRoutes } from 'react-router-config';
// import Loadable from 'react-loadable';
// import './App.scss';
// import loading from "./components/Loading";
//
// // const loading = () => <div className="animated fadeIn pt-3 text-center">Loading...</div>;
//
// // Containers
// const DefaultLayout = Loadable({
//     loader: () => import('./containers/DefaultLayout'),
//     loading
// });
//
// // Pages
// const Login = Loadable({
//     loader: () => import('./components/Pages/Login'),
//     loading
// });
//
// const Register = Loadable({
//     loader: () => import('./components/Pages/Register'),
//     loading
// });
//
// const Page404 = Loadable({
//     loader: () => import('./components/Pages/Page404'),
//     loading
// });
//
// const Page500 = Loadable({
//     loader: () => import('./components/Pages/Page500'),
//     loading
// });
//
// class App extends Component {
//
//     render() {
//         return (
//             <HashRouter>
//                 <Switch>
//                     <Route exact path="/login" name="Login Page" component={Login} />
//                     <Route exact path="/register" name="Register Page" component={Register} />
//                     <Route exact path="/404" name="Page 404" component={Page404} />
//                     <Route exact path="/500" name="Page 500" component={Page500} />
//                     <Route path="/" name="Home" component={DefaultLayout} />
//                 </Switch>
//             </HashRouter>
//         );
//     }
// }
//
// export default App;

import React, { Component } from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
// import { renderRoutes } from 'react-router-config';
import './App.scss';

const loading = () => <div className="animated fadeIn pt-3 text-center">Loading...</div>;

// Containers
const DefaultLayout = React.lazy(() => import('./containers/DefaultLayout'));

// Pages
const Login = React.lazy(() => import('./components/Pages/Login'));
const Register = React.lazy(() => import('./components/Pages/Register'));
const Page404 = React.lazy(() => import('./components/Pages/Page404'));
const Page500 = React.lazy(() => import('./components/Pages/Page500'));

class App extends Component {

    render() {
        return (
            <HashRouter>
                <React.Suspense fallback={loading()}>
                    <Switch>
                        <Route exact path="/login" name="Login Page" render={props => <Login {...props}/>} />
                        <Route exact path="/register" name="Register Page" render={props => <Register {...props}/>} />
                        <Route exact path="/404" name="Page 404" render={props => <Page404 {...props}/>} />
                        <Route exact path="/500" name="Page 500" render={props => <Page500 {...props}/>} />
                        <Route path="/" name="Home" render={props => <DefaultLayout {...props}/>} />
                    </Switch>
                </React.Suspense>
            </HashRouter>
        );
    }
}

export default App;
