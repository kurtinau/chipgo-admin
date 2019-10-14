import React from 'react';
import {ErrorMessage, FastField, Field, Formik} from "formik";
import FormGroup from "reactstrap/es/FormGroup";
import {Card, Col, Form, Input, InputGroup, InputGroupAddon, InputGroupText, Row} from "reactstrap";
import Label from "reactstrap/es/Label";
import AppSwitch from "@coreui/react/es/Switch";
import AsyncDropdownTreeSelect from "./AsyncDropdownTreeSelect";
import CardHeader from "reactstrap/es/CardHeader";
import UncontrolledCollapse from "reactstrap/es/UncontrolledCollapse";
import CardBody from "reactstrap/es/CardBody";
import WysiwygEditor from "./WysiwygEditor";
import ImageVideoUploader from "./ImageVideoUploader";
import ButtonGroup from "reactstrap/es/ButtonGroup";
import Button from "reactstrap/es/Button";
import {isEmpty} from "../../../util";
import {isUndefined} from "lodash";

const ProductForm =
    ({
         values,
         touched,
         dirty,
         errors,
         handleChange,
         handleBlur,
         handleSubmit,
         handleReset,
         setFieldValue,
         isSubmitting,
     }) => {
        const fieldClassName = (filedName) => {
            const error = errors[filedName];
            const touch = touched[filedName];
            if (!touch) {
                return '';
            } else if (error && touch) {
                return 'is-invalid';
            } else {
                return 'is-valid';
            }

            // return errors[filedName] && touched[filedName] ? 'is-invalid' : 'is-valid';
        };
        return (
            <Form>
                <FormGroup row>
                    <Col sm={2}>
                        <Label for="is_published">Enable Product</Label>
                    </Col>
                    <Col sm={10}>
                        <AppSwitch id="is_published" name="is_published" className={'mx-1'}
                                   color={'success'} variant={'3d'}
                                   checked={values.is_published === 1 || false}
                                   onChange={handleChange}
                                   onBlur={handleBlur}/>
                    </Col>
                </FormGroup>
                <FormGroup row>
                    <Col sm={2}>
                        <Label for="name">Name</Label>
                    </Col>
                    <Col sm={10}>
                        <Field name="name" placeholder="Name" className={"form-control " + fieldClassName('name')}
                               onBlur={handleBlur}/>
                        <ErrorMessage
                            name="name"
                            component="div"
                            className="field-error"
                        />
                    </Col>
                </FormGroup>
                <FormGroup row>
                    <Col sm={2}>
                        <Label for="SKU">SKU</Label>
                    </Col>
                    <Col sm={10}>
                        <Field name="sku" placeholder="SKU" className={"form-control " + fieldClassName('sku')}
                               onBlur={handleBlur}/>
                        <ErrorMessage
                            name="sku"
                            component="div"
                            className="field-error"
                        />
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
                            <Field name="price" placeholder=".."
                                   className={"form-control " + fieldClassName('price')}
                                   onBlur={handleBlur}/>
                            <ErrorMessage
                                name="price"
                                component="div"
                                className="field-error"
                            />
                        </InputGroup>
                    </Col>
                </FormGroup>
                <FormGroup row>
                    <Col sm={2}>
                        <Label for="categories">Categories</Label>
                    </Col>
                    <Col sm={10}>
                        <Field name="category_id" render={() => (
                            <AsyncDropdownTreeSelect data={values.categories}
                                                     onChange={(currentNode, selectedNodes) => {
                                                         const ids = selectedNodes.map(node => node.id);
                                                         setFieldValue('category_id', ids.toString());
                                                     }}
                                                     onBlur={handleBlur}
                            />
                        )}/>
                    </Col>
                </FormGroup>

                <Card>
                    <CardHeader id="productContent" className="cursor-pointer">Content
                        <span className="fa fa-arrow-down float-right"></span>
                    </CardHeader>
                    <UncontrolledCollapse toggler="#productContent" id="productContent-collapse">
                        <CardBody>
                            <FormGroup row>
                                <Col sm={2}>
                                    <Label for="description">Description</Label>
                                </Col>
                                <Col sm={10}>
                                    <WysiwygEditor description={values.description}
                                                   onChange={setFieldValue} onBlur={handleBlur}/>
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
                            <Field name="file_path" render={() => <ImageVideoUploader file_path={values.file_path}
                                                                                      thumbnail_path={values.thumbnail_path}
                                                                                      product_id={values.id || 0}
                                                                                      onChange={(files)=>{
                                                                                          console.log('fielsssss: ', files);
                                                                                          setFieldValue('files', files);
                                                                                      }}
                                                                                      files={values.files}
                                                                                      onBlur={handleBlur}
                                // waiting2UploadIncrement={waiting2UploadIncrement}
                                // waiting2UploadDecrement={waiting2UploadDecrement}
                            />}/>
                        </CardBody>
                    </UncontrolledCollapse>
                </Card>

                <Row>
                    <Col className="ml-auto">
                        <ButtonGroup>
                            <Button color="secondary" onClick={handleReset}
                                    disabled={!dirty || isSubmitting}>Reset</Button>
                            <Button color="primary" onClick={handleSubmit}
                                    disabled={isSubmitting}>Save</Button>
                        </ButtonGroup>
                    </Col>
                </Row>
            </Form>
        )
    };

export default ProductForm;