import {connect} from 'react-redux';
import {
    getDescriptionContent,
    getDropdownTreeSelectData, getDropdownTreeSelectDataByCategoryIds, getFilePath,
    getProduct
} from "../../selectors/Catalog/Products";
import {editProduct, fetchProductByid, fetchProducts} from "../../actions/Catalog/Products";
import {fetchCategories} from "../../actions/Catalog/Categories";
import EditProduct from "../../components/Catalog/Products/EditProduct";
import {showModal, showToast} from "../../actions/Notification";

const mapStateToProps = (state, ownProps) => ({
    product: getProduct(state, ownProps.match.params.id),
    categories: getDropdownTreeSelectDataByCategoryIds(state,ownProps.match.params.id),
    description: getDescriptionContent(state),
    // file_path: getFilePath(state),
});

const mapDispatchToProps = dispatch => ({
    submitProduct: (product) => dispatch(editProduct(product)),
    getCategories: () => dispatch(fetchCategories()),
    getProductByid: (id) => dispatch(fetchProductByid(id)),
    showToast: (obj) => dispatch(showToast(obj)),
    showModal: (obj) => dispatch(showModal(obj)),
});

export default connect(mapStateToProps, mapDispatchToProps)(EditProduct);