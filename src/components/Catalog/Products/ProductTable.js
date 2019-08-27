import React from 'react';
import {Badge, Col, Table} from "reactstrap";
import ProductTableHead from "./ProductTableHead";
import ProductRow from "./ProductRow";
import {isEmpty} from "lodash";

const ProductTable = (props) => {
    const {productList} = props;
    return (
        <Table hover bordered striped responsive size="sm" className="product-table">
            <ProductTableHead/>
            <tbody>
            {isEmpty(productList) ?
                null :
                productList.map(id => <ProductRow {...props} id={id} key={id}/>)}
            </tbody>
        </Table>
    );
};

export default ProductTable;