import React, {Component} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {getDropdownTreeSelectDataByCategoryIds, getProduct} from "../../../selectors/Catalog/Products";
import ProductForm from "./ProductForm";
import {isEmpty, isEqual, isUndefined} from "lodash";
import {set} from 'lodash/fp';
import {deleteProductFiles, fetchProducts} from "../../../actions/Catalog/Products";
import {fetchCategories} from "../../../actions/Catalog/Categories";
import {INFO, WARNING} from "../../../constants/Notification";


export default class EditProduct extends Component {
    constructor(props) {
        super(props);
        this.state = {
            product: props.product,
            originalProduct: props.product,
            waiting2Upload: 0,
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handelDropdownSelectChange = this.handelDropdownSelectChange.bind(this);
        this.imageWaiting2UploadIncrement = this.imageWaiting2UploadIncrement.bind(this);
        this.imageWaiting2UploadDecrement = this.imageWaiting2UploadDecrement.bind(this);
        this.toast4FieldEmpty = this.toast4FieldEmpty.bind(this);
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
            // category_id: ids.toString()
            product: set('category_id', ids.toString(), this.state.product),
            category_id: ids.toString(),
        });
    }

    toast4FieldEmpty(fieldName) {
        this.props.showToast({
            type: WARNING,
            content: fieldName + ' cannot be empty.',
        });
    }

    handleSubmit() {
        const {originalProduct, name, sku, price, is_published, category_id, waiting2Upload} = this.state;
        const {description, showToast, showModal, submitProduct} = this.props;
        let editedProduct = {};
        let validation = true;
        if (!isUndefined(name) && (name !== originalProduct.name)) {
            if (isEmpty(name.trim())) {
                this.toast4FieldEmpty('Name');
                validation = false;
            } else {
                editedProduct.name = name;
                console.log('name: ', name);
            }
        }
        if (!isUndefined(sku) && (sku !== originalProduct.sku)) {
            if (isEmpty(sku.trim())) {
                this.toast4FieldEmpty('SKU');
                validation = false;
            } else {
                editedProduct.sku = sku;
                console.log('sku: ', sku);
            }
        }
        if (!isUndefined(price) && (price !== originalProduct.price)) {
            if (isEmpty(price.trim())) {
                this.toast4FieldEmpty('Price');
                validation = false;
            } else {
                editedProduct.price = price;
                console.log('originalProduct.price: ',originalProduct.price);
                console.log('price: ', price);
            }
        }
        if (!isUndefined(is_published) && (is_published !== originalProduct.is_published)) {
            editedProduct.is_published = is_published;
            console.log('is_published: ', is_published);
        }
        if (!isUndefined(category_id) && (category_id !== originalProduct.category_id)) {
            editedProduct.category_id = category_id;
            console.log('category_id: ', category_id);
        }
        if (!isEmpty(description) && !isEqual(description.raw, originalProduct.description)) {
            editedProduct.description = description;
            editedProduct.originalDescription = originalProduct.description;
        }
        if (!isEmpty(editedProduct)) {
            editedProduct.id = originalProduct.id;
            if (waiting2Upload > 0) {
                showModal({
                    title: 'Submit Change?',
                    content: 'There are images waiting for upload, do you want save change without uploading images?',
                    type: 'confirm',
                    onConfirm: () => {
                        console.log('EDIT;:: ', editedProduct);
                        submitProduct(editedProduct);
                        showToast({
                            type: WARNING,
                            content: 'There are images waiting for upload, You have to click upload button to upload images.'
                        });
                    }
                });
            } else if (validation) {
                submitProduct(editedProduct);
            }

        } else if (waiting2Upload > 0) {
            showToast({
                type: WARNING,
                content: 'Nothing changed, but there are images waiting for upload, if you wanna add new product image, just click upload button...'
            });
        } else {
            if (validation)
                showToast({type: INFO, content: 'Nothing Changed...'});
        }
    }

    imageWaiting2UploadIncrement() {
        this.setState({
            waiting2Upload: this.state.waiting2Upload + 1,
        });
    }

    imageWaiting2UploadDecrement() {
        this.setState({
            waiting2Upload: this.state.waiting2Upload - 1,
        });
    }


    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!isEmpty(this.props.product) && isEmpty(prevState.product)) {
            console.log('did update');
            this.setState({
                product: this.props.product,
                originalProduct: this.props.product,
            });
        }
    }

    // shouldComponentUpdate(nextProps, nextState, nextContext) {
    //     if (isEqual(this.state.originalProduct, nextProps.product)) {
    //         console.log('this product: ', this.state.originalProduct);
    //         console.log('next product: ', nextProps.product);
    //         return false;
    //     } else {
    //         return true;
    //     }
    // }

    componentDidMount() {
        this.props.getProductByid(this.props.match.params.id);
        this.props.getCategories();
    }

    render() {
        const {categories} = this.props;
        return (
            <ProductForm {...this.props} product={this.state.product} handleSubmit={this.handleSubmit}
                         handleInputChange={this.handleInputChange}
                         handelDropdownSelectChange={this.handelDropdownSelectChange} categories={categories}
                         title={"Edit"} waiting2UploadIncrement={this.imageWaiting2UploadIncrement}
                         waiting2UploadDecrement={this.imageWaiting2UploadDecrement}
            />
        );
    }
}

// const handleSubmit = (product) => {
//
// };
//
// const EditProduct = (props) => {
//     const dispatch = useDispatch();
//     const id = props.match.params.id;
//     const product = useSelector(state => getProduct(state, id));
//     let category_ids = [];
//     let categories = useSelector(state => getDropdownTreeSelectDataByCategoryIds(state, category_ids));
//     if (isEmpty(product)) {
//         dispatch(fetchProducts());
//     } else if (isEmpty(categories)) {
//         dispatch(fetchCategories());
//     } else {
//         category_ids = product.category_id.split(',');
//     }
//     console.log('pro: ', product);
//     console.log('ccc: ', categories);
//     return (
//         <ProductForm {...props} product={product} parentSubmitClick={handleSubmit} categories={categories}/>
//     );
// };
// export default EditProduct;
