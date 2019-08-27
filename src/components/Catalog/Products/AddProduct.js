import React, {Component} from 'react';
import 'react-dropzone-uploader/dist/styles.css'
import ProductForm from "./ProductForm";
import {set} from "lodash/fp";


export default class AddProduct extends Component {
    constructor(props) {
        super(props);
        this.state = {
            product: {
                id: -1,
                description: {},
                is_published: false,
            },
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handelDropdownSelectChange = this.handelDropdownSelectChange.bind(this);
    }


    handleSubmit() {
        const {originalProduct, name, sku, price, is_published, category_id} = this.state;
        const {description, showToast, showModal, submitProduct, files} = this.props;
        console.log('p:: ', this.state.product);
        console.log('filesss: ', files)
        // this.props.submitProduct(product);
    }


    componentDidMount() {
        if (this.props.categories.length === 0) {
            this.props.initialDropdown();
        }
    }

    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? (target.checked ? 1 : 0) : target.value;
        const name = target.name;
        this.setState({
            product: set(name, value, this.state.product),
            [name]: value,
        });
    }

    handelDropdownSelectChange(currentNode, selectedNodes) {
        const ids = selectedNodes.map(node => node.id);
        this.setState({
            product: set('category_id', ids.toString(), this.state.product),
            category_id: ids.toString(),
        });
    }

    render() {
        const {categories} = this.props;
        return (
            <ProductForm {...this.props} product={this.state.product} handleSubmit={this.handleSubmit} title={"Add"}
                         categories={categories}
                         handleInputChange={this.handleInputChange}
                         handelDropdownSelectChange={this.handelDropdownSelectChange}
            />
        );
    }
}
