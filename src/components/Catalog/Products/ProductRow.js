import React, {Fragment, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Badge} from "reactstrap";
import {makeGetProductWithoutDescription} from "../../../selectors/Catalog/Products";
import Button from "reactstrap/es/Button";
import {showModal} from "../../../actions/Notification";
import MyModal from "../../Notification";
import {isEmpty} from "lodash";
import defaultImg from '../../../assets/img/no-picture.png';

const ProductRow = (props) => {
    const dispatch = useDispatch();
    const {id} = props;
    //Sharing Selectors with Props Across Multiple Component Instances
    const getProductWithoutDescription = useMemo(makeGetProductWithoutDescription, []);
    const productWithoutDescription = useSelector(state => getProductWithoutDescription(state, id));
    let imagePath = [];
    if (isEmpty(productWithoutDescription.file_path)) {
        imagePath.push(defaultImg);
    } else {
        imagePath = productWithoutDescription.file_path.split(',');
    }
    return (
        <Fragment>
            <tr onClick={() => {
                props.history.push(props.match.url + '/edit/' + productWithoutDescription.id)
            }}>
                <td>{productWithoutDescription.id}</td>
                <td>
                    <img className="img-fluid img-thumbnail product-img" src={imagePath[0]}/>
                </td>
                <td>{productWithoutDescription.name}</td>
                <td>{productWithoutDescription.type_id}</td>
                <td>{productWithoutDescription.sku}</td>
                <td>${productWithoutDescription.price}</td>
                <td>{new Date(productWithoutDescription.created_time).toLocaleDateString('en-GB')}</td>
                <td>{new Date(productWithoutDescription.updated_time).toLocaleDateString('en-GB')}</td>
                <td>
                    {productWithoutDescription.is_published === 1 ?
                        <Badge color="success">Active</Badge>
                        :
                        <Badge color="danger"> Disabled </Badge>
                    }
                </td>
                <td><Button onClick={(e) => {
                    e.stopPropagation();
                    dispatch(showModal({
                        title: 'test', content: 'teststststst', type: 'confirm', onConfirm: () => {
                            console.log('hello')
                        }
                    }));
                }}>modal</Button></td>
            </tr>
        </Fragment>
    );
};

export default ProductRow;