import React, {Component} from 'react';
import Loadable from "react-loadable";
import loading from "../../Loading";
import {Route, Switch} from "react-router-dom";
import AddProduct from "../../../containers/Products/AddProduct";
import ProductsView from "../../../containers/Products/ProductsView";
import EditProduct from "../../../containers/Products/EditProduct";
// import EditProduct from "./EditProduct";

// const AddProductModal = Loadable({
//     loader: () => import('./AddProduct'),
//     loading
// });

export default class Products extends Component {

    render() {
        return (
            <div>
                <Switch>
                    {/*<ProductList />*/}
                    <Route exact path={this.props.match.url} component={ProductsView}></Route>
                    <Route path={this.props.match.url + "/add"} component={AddProduct}></Route>
                    <Route path={this.props.match.url + '/edit/:id'} component={EditProduct}></Route>
                </Switch>
            </div>
        );
    }

}