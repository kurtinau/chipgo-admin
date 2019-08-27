import React, {Component} from 'react';
import {
    Badge,
    Button,
    Card,
    CardBody,
    CardHeader, Col, Input, InputGroup, InputGroupAddon, InputGroupText,
    Pagination,
    PaginationItem,
    PaginationLink,
    Row,
    Table
} from "reactstrap";
import {Link} from "react-router-dom";
import ProductTable from "./ProductTable";
import {isEmpty} from "lodash";
import MyModal from "../../Notification";

export default class ProductsView extends Component {

    componentDidMount() {
        this.props.fetchProducts();
    }

    render() {
        const {productList} = this.props;
        return (
            <div>
                <Card>
                    <CardHeader>
                        <h2>Products
                            {/*<a className="btn btn-success btn-lg float-right" role="button" href="#"><span*/}
                            {/*    className="fa fa-plus"></span> Add Product</a>*/}
                            <Link to={this.props.match.url + "/add"} className="btn btn-success btn-lg float-right"
                                  role="button"><span className="fa fa-plus"></span> Add Product</Link>
                        </h2>
                    </CardHeader>
                    <CardBody>
                        <Row>
                            <Col sm="12" md={{size: 3}}>
                                <InputGroup>
                                    <Input type="text" id="search" name="search" placeholder="Search by keyword" />
                                    <InputGroupAddon addonType="append">
                                        <Button type="button" color="primary"><i className="fa fa-search"></i> Search</Button>
                                    </InputGroupAddon>
                                </InputGroup>
                            </Col>
                            <Col sm="12" md={{size: 2, offset:2}}>
                                <InputGroup>
                                    <Input type="select" name="select" id="exampleSelect">
                                        <option>20</option>
                                        <option>30</option>
                                        <option>50</option>
                                        <option>100</option>
                                        <option>200</option>
                                    </Input>
                                    <InputGroupAddon addonType="append">
                                        <InputGroupText>per page</InputGroupText>
                                    </InputGroupAddon>
                                </InputGroup>

                            </Col>
                            <Col sm="12" md={{size: 5}}>
                                <nav className="float-right">
                                    <Pagination>
                                        <PaginationItem><PaginationLink previous
                                                                        tag="button">Prev</PaginationLink></PaginationItem>
                                        <PaginationItem active>
                                            <PaginationLink tag="button">1</PaginationLink>
                                        </PaginationItem>
                                        <PaginationItem><PaginationLink tag="button">2</PaginationLink></PaginationItem>
                                        <PaginationItem><PaginationLink tag="button">3</PaginationLink></PaginationItem>
                                        <PaginationItem><PaginationLink tag="button">4</PaginationLink></PaginationItem>
                                        <PaginationItem><PaginationLink next
                                                                        tag="button">Next</PaginationLink></PaginationItem>
                                    </Pagination>
                                </nav>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <ProductTable {...this.props} productList={isEmpty(productList) ? null : productList}/>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
                {/*<MyModal/>*/}
            </div>
        );
    };
}