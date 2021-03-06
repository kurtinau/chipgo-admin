import {connect} from 'react-redux';
import Categories from "../../components/Catalog/Categories";
import {fetchCategories} from "../../actions/Catalog/Categories";
import {createErrorMessageSelector, createLoadingSelector} from "../../selectors/Api";
import {getCategories} from "../../selectors/Catalog/Categories";
import {showModal} from "../../actions/Notification";

const loadingSelector = createLoadingSelector(['GET_CATEGORIES']);
// const loadingError = createErrorMessageSelector(['GET_CATEGORIES']);

const mapStateToProps = state => ({
    isLoading: loadingSelector(state),
    // loadingError: loadingError(state),
    categories: getCategories(state),
});


const mapDispatchToProps = (dispatch) => ({
    fetchCategories: () => dispatch(fetchCategories()),
    modalTest: () => dispatch(showModal({
        title: 'test', content: 'teststststst', type: 'confirm', onConfirm: () => {
            console.log('hello')
        }
    })),
});


export default connect(mapStateToProps, mapDispatchToProps)(Categories);