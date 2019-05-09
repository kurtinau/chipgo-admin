import {connect} from 'react-redux';
import RevisionHistory from "../../components/Catalog/Categories/RevisionHistory/RevisionHistory";
import {
    getEditHistory,
    getNewAddHistory,
    getCategoriesByEdited,
    getParentCategoriesByEdited,
    getParentNodesByNewAdded,
    getChildNodesByEdited,
    getSiblingsByEditedAndAddedNodes,
} from "../../selectors/Catalog/Categories";
import {push2Undo, editCategory, addCategory} from "../../actions/Catalog/Categories";

const mapStateToProps = (state, props) => ({
    editedNodes: getEditHistory(state),
    newNodes: getNewAddHistory(state),
    originalNodesByEditedNodes : getCategoriesByEdited(state),
    parentNodesByEditedNodes: getParentCategoriesByEdited(state),
    parentNodesByNewAddedNodes: getParentNodesByNewAdded(state),
    childNodesByEditedNodes: getChildNodesByEdited(state),
    siblingsByEditedAndNewAddedNodes: getSiblingsByEditedAndAddedNodes(state),
});

const mapDispatchToProps = (dispatch) => ({
    push2Undo : (node) => dispatch(push2Undo(node)),
    editCategory: (node) => dispatch(editCategory(node)),
    addCategory: (node) => dispatch(addCategory(node)),
});


export default connect(mapStateToProps, mapDispatchToProps)(RevisionHistory);