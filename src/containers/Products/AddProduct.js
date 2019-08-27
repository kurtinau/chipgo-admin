import {connect} from 'react-redux';
import AddProduct from "../../components/Catalog/Products/AddProduct";
import {getDescriptionContent, getDropdownTreeSelectData, getFiles} from "../../selectors/Catalog/Products";
import {addProduct} from "../../actions/Catalog/Products";
import {fetchCategories} from "../../actions/Catalog/Categories";
import {showModal, showToast} from "../../actions/Notification";

const mapStateToProps = state => ({
    description: getDescriptionContent(state),
    files: getFiles(state),
    categories: getDropdownTreeSelectData(state),
});

const mapDispatchToProps = dispatch => ({
    submitProduct: (product) => dispatch(addProduct(product)),
    initialDropdown: () => dispatch(fetchCategories()),
    showToast: (obj) => dispatch(showToast(obj)),
    showModal: (obj) => dispatch(showModal(obj)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AddProduct);