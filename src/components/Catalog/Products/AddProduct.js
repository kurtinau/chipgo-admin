import React, {useEffect, useMemo} from 'react';
import 'react-dropzone-uploader/dist/styles.css'
import {set} from "lodash/fp";
import ProductForm from "./ProductForm";
import CardHeader from "reactstrap/es/CardHeader";
import CardBody from "reactstrap/es/CardBody";
import {Card, Col, Form, Input, InputGroup, InputGroupAddon, InputGroupText, Row} from "reactstrap";
import {withFormik} from "formik";
import {EditorState, convertFromRaw, convertToRaw, RichUtils} from 'draft-js';
import {useDispatch, useSelector} from "react-redux";
import {
    getFiles,
    makeGetDropdownTreeSelectData,
} from "../../../selectors/Catalog/Products";
import {fetchCategories} from "../../../actions/Catalog/Categories";
import * as Yup from 'yup';
import {isEmpty, isUndefined} from "lodash";
import {addProduct} from "../../../actions/Catalog/Products";

const AddProduct = (props) => {
    const dispatch = useDispatch();
    useEffect(() => {
        // Update the document title using the browser API
        dispatch(fetchCategories());
    }, []);

    const getDropdownTreeSelectData = useMemo(makeGetDropdownTreeSelectData, []);
    const categories = useSelector(state => getDropdownTreeSelectData(state));
    // const newFilePath = useSelector(state => getFiles(state));
    const formikEnhancer = withFormik({
        mapPropsToValues: props => ({
            description: new EditorState.createEmpty(),
            is_published: 0,
            name: '',
            sku: '',
            price: 0,
            categories: categories,
            category_id: '',
            file_path: '',
            files: [],
            thumbnail_path: '',
            id: 0,
        }),
        validationSchema: Yup.object().shape({
            name: Yup.string()
                .trim()
                .required('Required!'),
            sku: Yup.string()
                .trim()
                .required('Required!'),
            price: Yup.number()
                .min(1, 'The minimal price is $1!')
                .positive('The price must be a positive number!')
                .required('Required!'),
        }),
        handleSubmit: (values, {setSubmitting}) => {
            setTimeout(() => {
                // you probably want to transform draftjs state to something else, but I'll leave that to you.
                // alert(JSON.stringify(values, null, 2));
                console.log("values: ", values);
                let newProduct = {
                    is_published: values.is_published ? 1 : 0,
                    name: values.name.trim(),
                    sku: values.sku.trim(),
                    price: values.price,
                };
                if (!isEmpty(values.category_id)) {
                    newProduct.category_id = values.category_id;
                }
                const contentState = values.description.getCurrentContent();
                if (contentState.hasText()) {
                    const contentRaw = convertToRaw(contentState);
                    console.log('descriptionRAW: ', contentRaw);
                    if (!isEmpty(contentRaw.entityMap)) {
                        newProduct.description = contentRaw;
                    } else {
                        const currentPlainText = contentState.getPlainText();
                        if (currentPlainText.trim().length !== 0) {
                            newProduct.description = contentRaw;
                        }
                    }
                }
                if (!isEmpty(values.files)) {
                    let newFiles = [];
                    values.files.forEach(value => newFiles.push({
                        uuid: value.upload.uuid,
                        url: URL.createObjectURL(value),
                        lastModified: value.lastModified,
                        name: value.name,
                        type: value.type,
                    }));
                    newProduct.files = newFiles;
                }
                console.log('newProduct: ', newProduct);
                dispatch(addProduct(newProduct));
                setSubmitting(false);
            }, 1000);
        },
        displayName: 'AddProductForm',
    });
    const EnhancerAddProductForm = formikEnhancer(ProductForm);
    return (
        <Card>
            <CardHeader>
                <h2>Add Product
                    <button className="btn btn-success btn-lg float-right"
                            onClick={props.history.goBack}><span className="fa fa-arrow-left"></span> Back
                    </button>
                </h2>
            </CardHeader>
            <CardBody>
                <EnhancerAddProductForm/>
                {/*<ProductForm product={this.state.product} categories={categories}/>*/}
            </CardBody>
        </Card>
    );
};

export default AddProduct;

// export default class AddProduct extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             product: {
//                 id: -1,
//                 description: {},
//                 is_published: false,
//                 name: '',
//                 sku: '',
//                 price: 0,
//                 category_id: '',
//             },
//         };
//         this.handleSubmit = this.handleSubmit.bind(this);
//         this.handleInputChange = this.handleInputChange.bind(this);
//         this.handelDropdownSelectChange = this.handelDropdownSelectChange.bind(this);
//     }
//
//
//     handleSubmit() {
//         const {originalProduct, name, sku, price, is_published, category_id} = this.state;
//         const {description, showToast, showModal, submitProduct, files} = this.props;
//         console.log('p:: ', this.state.product);
//         console.log('filesss: ', files)
//         // this.props.submitProduct(product);
//     }
//
//
//     componentDidMount() {
//         if (this.props.categories.length === 0) {
//             this.props.initialDropdown();
//         }
//     }
//
//     handleInputChange(event) {
//         const target = event.target;
//         const value = target.type === 'checkbox' ? (target.checked ? 1 : 0) : target.value;
//         const name = target.name;
//         this.setState({
//             product: set(name, value, this.state.product),
//             [name]: value,
//         });
//     }
//
//     handelDropdownSelectChange(currentNode, selectedNodes) {
//         const ids = selectedNodes.map(node => node.id);
//         this.setState({
//             product: set('category_id', ids.toString(), this.state.product),
//             category_id: ids.toString(),
//         });
//     }
//
//     render() {
//         const {categories} = this.props;
//         return (
//             <Card>
//                 <CardHeader>
//                     <h2>Add Product
//                         <button className="btn btn-success btn-lg float-right"
//                                 onClick={this.props.history.goBack}><span className="fa fa-arrow-left"></span> Back
//                         </button>
//                     </h2>
//                 </CardHeader>
//                 <CardBody>
//                     <ProductForm product={this.state.product} categories={categories}/>
//                 </CardBody>
//             </Card>
//         );
//     }
// }


{/*<ProductForm {...this.props} product={this.state.product} handleSubmit={this.handleSubmit} title={"Add"}*/
}
{/*             categories={categories}*/
}
{/*             handleInputChange={this.handleInputChange}*/
}
{/*             handelDropdownSelectChange={this.handelDropdownSelectChange}*/
}
{/*/>*/
}

