import React, {Component} from 'react';
import {Card, Col, CustomInput, Form, Input, InputGroup, InputGroupAddon, InputGroupText, Row} from "reactstrap";
import CardHeader from "reactstrap/es/CardHeader";
import CardBody from "reactstrap/es/CardBody";
import FormGroup from "reactstrap/es/FormGroup";
import Label from "reactstrap/es/Label";
import AppSwitch from "@coreui/react/es/Switch";
import UncontrolledCollapse from "reactstrap/es/UncontrolledCollapse";
import ImageVideoUploader from "./ImageVideoUploader";
import ButtonGroup from "reactstrap/es/ButtonGroup";
import Button from "reactstrap/es/Button";
import {isEmpty, isEqual, isUndefined} from "lodash";
import AsyncDropdownTreeSelect from "./AsyncDropdownTreeSelect";
import WysiwygEditor from "./WysiwygEditor";

export default class ProductForm extends Component {
    // constructor(props) {
    //     super(props);
    //     const {product} = props;
    //     this.state = {
    //         is_published: product.is_published === 1,
    //         name: product.name,
    //         SKU: product.sku,
    //         price: product.price,
    //         category_id: product.category_id,
    //     };
    //     this.handleInputChange = this.handleInputChange.bind(this);
    //     this.handleSubmit = this.handleSubmit.bind(this);
    //     this.handelDropdownSelectChange = this.handelDropdownSelectChange.bind(this);
    // }

    // componentDidMount() {
    //     const {product} = this.props;
    //     console.log('mou-pro: ', product);
    //     if (!isEmpty(product)) {
    //         this.setState({
    //             is_published: product.is_published === 1,
    //             name: product.name,
    //             SKU: product.sku,
    //             price: product.price,
    //             category_id: product.category_id,
    //         });
    //     }
    // }

    // shouldComponentUpdate(nextProps, nextState, nextContext) {
    //     const flag = !isEqual(this.props.product, nextProps.product);
    //     console.log('update: ', flag);
    //     return flag;
    // }

    // handleInputChange(event) {
    //     const target = event.target;
    //     const value = target.type === 'checkbox' ? target.checked : target.value;
    //     const name = target.name;
    //
    //     this.setState({
    //         [name]: value
    //     });
    // }
    //
    // handelDropdownSelectChange(currentNode, selectedNodes) {
    //     const ids = selectedNodes.map(node => node.id);
    //     this.setState({
    //         category_id: ids.toString()
    //     });
    // }
    //
    // handleSubmit() {
    //     const uploadedImagesPath = this.props.file_path;
    //     let file_path = [];
    //     uploadedImagesPath.forEach(file =>
    //         file_path.push(file.path)
    //     );
    //     const product = {
    //         name: this.state.name,
    //         sku: this.state.SKU,
    //         price: this.state.price,
    //         is_published: this.state.is_published ? 1 : 0,
    //         description: this.props.description,
    //         file_path: file_path,
    //         category_id: this.state.category_id,
    //     };
    //     this.props.parentSubmitClick(product);
    // }


    render() {
        const {product, handleSubmit, handleInputChange, handelDropdownSelectChange, categories, title} = this.props;
        let {waiting2UploadIncrement, waiting2UploadDecrement} = this.props;
        if (isUndefined(waiting2UploadIncrement) || isUndefined(waiting2UploadDecrement)) {
            waiting2UploadIncrement = () => {};
            waiting2UploadDecrement = () => {};
        }
        return (
            <div>
                <Card>
                    <CardHeader>
                        <h2>{title} Product
                            <button className="btn btn-success btn-lg float-right"
                                    onClick={this.props.history.goBack}><span className="fa fa-arrow-left"></span> Back
                            </button>
                        </h2>
                    </CardHeader>
                    <CardBody>
                        <Form>
                            <FormGroup row>
                                <Col sm={2}>
                                    <Label for="is_published">Enable Product</Label>
                                </Col>
                                <Col sm={10}>
                                    <AppSwitch id="is_published" name="is_published" className={'mx-1'}
                                               color={'success'} variant={'3d'}
                                               checked={product.is_published === 1 || false}
                                               onChange={handleInputChange}/>
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Col sm={2}>
                                    <Label for="name">Name</Label>
                                </Col>
                                <Col sm={10}>
                                    <Input type="text" id="name" name="name" value={product.name || ''}
                                           placeholder="Name"
                                           onChange={handleInputChange}/>
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Col sm={2}>
                                    <Label for="SKU">SKU</Label>
                                </Col>
                                <Col sm={10}>
                                    <Input type="text" id="sku" name="sku" value={product.sku || ''} placeholder="SKU"
                                           onChange={handleInputChange}/>
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Col sm={2}>
                                    <Label for="price">Price</Label>
                                </Col>
                                <Col sm={10}>
                                    <InputGroup>
                                        <InputGroupAddon addonType="prepend">
                                            <InputGroupText>
                                                <i className="fa fa-dollar"></i>
                                            </InputGroupText>
                                        </InputGroupAddon>
                                        <Input type="number" id="price" name="price" value={product.price || ''}
                                               placeholder=".." onChange={handleInputChange}/>
                                        <InputGroupAddon addonType="append">
                                            <InputGroupText>.00</InputGroupText>
                                        </InputGroupAddon>
                                    </InputGroup>
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Col sm={2}>
                                    <Label for="categories">Categories</Label>
                                </Col>
                                <Col sm={10}>
                                    <AsyncDropdownTreeSelect data={categories}
                                                             onChange={handelDropdownSelectChange}/>
                                </Col>
                            </FormGroup>
                            <Card>
                                <CardHeader id="content" className="cursor-pointer">Content
                                    <span className="fa fa-arrow-down float-right"></span>
                                </CardHeader>
                                <UncontrolledCollapse toggler="#content" id="content-collapse">
                                    <CardBody>
                                        <FormGroup row>
                                            <Col sm={2}>
                                                <Label for="description">Description</Label>
                                            </Col>
                                            <Col sm={10}>
                                                <WysiwygEditor description={product.description || {}}/>
                                            </Col>
                                        </FormGroup>
                                    </CardBody>
                                </UncontrolledCollapse>
                            </Card>

                            <Card>
                                <CardHeader id="images" className="cursor-pointer">Images
                                    <span className="fa fa-arrow-down float-right"></span>
                                </CardHeader>
                                <UncontrolledCollapse toggler="#images" id="images-collapse">
                                    <CardBody>
                                        {/*<ImageVideoUploader uploadedFiles={product.thumbnail_path || ''}/>*/}
                                        <ImageVideoUploader file_path={product.file_path || ''}
                                                            thumbnail_path={product.thumbnail_path || ''}
                                                            product_id={product.id || 0}
                                                            waiting2UploadIncrement={waiting2UploadIncrement}
                                                            waiting2UploadDecrement={waiting2UploadDecrement}
                                        />
                                    </CardBody>
                                </UncontrolledCollapse>
                            </Card>
                            <Row>
                                <Col className="ml-auto">
                                    <ButtonGroup>
                                        <Button color="secondary" onClick={this.props.history.goBack}>Cancel</Button>
                                        <Button color="primary" onClick={handleSubmit}>Save</Button>
                                    </ButtonGroup>
                                </Col>
                            </Row>
                        </Form>
                    </CardBody>
                </Card>
            </div>
        );
    }
};