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
    getFiles, getProduct,
    makeGetDropdownTreeSelectDataByCategoryIds,
} from "../../../selectors/Catalog/Products";
import * as Yup from 'yup';
import {isEmpty, isEqual, isUndefined} from "lodash";
import {addProduct, editProduct, fetchProductByid} from "../../../actions/Catalog/Products";
import {fetchCategories} from "../../../actions/Catalog/Categories";
import {INFO, WARNING} from "../../../constants/Notification";
import {showModal, showToast} from "../../../actions/Notification";

const EditProduct = (props) => {
    const id = props.match.params.id;
    const dispatch = useDispatch();
    useEffect(() => {
        // get product by id(props.match.params.id)
        dispatch(fetchProductByid(id));
    }, []);
    useEffect(() => {
        // get categories from server
        dispatch(fetchCategories());
    }, []);
    // select product by id
    const product = useSelector(state => getProduct(state, id));
    const getDropdownTreeSelectDataByCategoryIds = useMemo(makeGetDropdownTreeSelectDataByCategoryIds, []);
    const categories = useSelector(state => getDropdownTreeSelectDataByCategoryIds(state, id));
    if (!isEmpty(product) && !isEmpty(categories)) {
        const formikEnhancer = withFormik({
            mapPropsToValues: props => ({
                ...product,
                description: isEmpty(product.description) ? new EditorState.createEmpty() : EditorState.createWithContent(convertFromRaw(product.description)),
                categories: categories,
                files: 0,
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
                    let editedProduct = {};
                    const newName = values.name.trim();
                    const newPrice = values.price;
                    const newSku = values.sku.trim();
                    const newIspublished = values.is_published ? 1 : 0;
                    if (product.name !== newName)
                        editedProduct.name = newName;
                    if (product.price !== newPrice)
                        editedProduct.price = newPrice;
                    if (product.sku !== newSku)
                        editedProduct.sku = newSku;
                    if (product.is_published !== newIspublished)
                        editedProduct.is_published = newIspublished;

                    const contentState = values.description.getCurrentContent();
                    const contentRaw = convertToRaw(contentState);
                    console.log('descriptionRAW: ', contentRaw);
                    console.log('original desc:: ', product.description);
                    if (!isEqual(product.description, contentRaw))
                        editedProduct.description = contentRaw;
                    if (isEmpty(editedProduct)) {
                        if (values.files !== 0) {
                            //nothing changed expected images waiting to upload
                            dispatch(showToast({
                                type: WARNING,
                                content: 'Nothing changed, but there are images waiting for upload, if you wanna add new product image, just click upload button...'
                            }));
                        } else {
                            dispatch(showToast({type: INFO, content: 'Nothing Changed...'}));
                        }

                    } else {
                        editedProduct.id = product.id;
                        if (values.files !== 0) {
                            //something changed, and also there are images waiting to upload.
                            dispatch(showModal({
                                title: 'Submit Change?',
                                content: 'There are images waiting for upload, do you want save change without uploading images?',
                                type: 'confirm',
                                onConfirm: () => {
                                    console.log('EDIT;:: ', editedProduct);
                                    dispatch(editProduct(editedProduct));
                                }
                            }));
                        } else {
                            console.log('editedProduct: ', editedProduct);
                            dispatch(editProduct(editedProduct));
                        }
                    }
                    setSubmitting(false);
                }, 1000);
            },
            displayName: 'EditProductForm',
        });
        const EnhancerEditProductForm = formikEnhancer(ProductForm);
        return (
            <Card>
                <CardHeader>
                    <h2>Edit Product
                        <button className="btn btn-success btn-lg float-right"
                                onClick={props.history.goBack}><span className="fa fa-arrow-left"></span> Back
                        </button>
                    </h2>
                </CardHeader>
                <CardBody>
                    <EnhancerEditProductForm/>
                    {/*<ProForm product={this.state.product} categories={categories}/>*/}
                </CardBody>
            </Card>
        );
    } else
        return (<div></div>);

};

export default EditProduct;

