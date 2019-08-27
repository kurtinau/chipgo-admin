import ProductsView from '../../components/Catalog/Products/ProductsView';
import {connect} from "react-redux";
import {getProductsAllIds} from "../../selectors/Catalog/Products";
import {fetchProducts} from "../../actions/Catalog/Products";

const mapStateToProps = state => ({
    productList : getProductsAllIds(state),
});

const mapDispatchToProps = dispatch => ({
    fetchProducts: () => dispatch(fetchProducts()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ProductsView);