import { connect } from 'react-redux';
import TreeView from "../../components/Catalog/Categories/TreeView/TreeView";
import {
    setNodeEditing,
    push2History,
    removeUndoNode,
    resetFakeDeleting,
    editCategory,
    resetUnDeleting,
    deleteCategory,
    resetDeleting,
    resetAdding
} from "../../actions/Catalog/Categories";
import {
    getCategoriesByEdited,
    getEditHistory,
    getEditingNode,
    getLatestNewAddNodeId,
    getNodeByUndoNodeId,
    getUndoNode,
    getFakeDeleting,
    getUndeleting, getDeleting, getAdding
} from "../../selectors/Catalog/Categories";

const mapStateToProps = (state) => ({
    editingNode : getEditingNode(state),
    latestNewAddId: getLatestNewAddNodeId(state),
    undoNode : getUndoNode(state),
    originalNode : getNodeByUndoNodeId(state),
    editedNodes: getEditHistory(state),
    originalNodesByEditedNodes : getCategoriesByEdited(state),
    fakeDeleting: getFakeDeleting(state),
    unDeleting: getUndeleting(state),
    deleting: getDeleting(state),
    adding: getAdding(state),
    // originalCategory: getCategoryByUndoNodeId(state),
});

const mapDispatchToProps = (dispatch) => ({
    setNodeEditing : (id) => dispatch(setNodeEditing(id)),
    push2History: (node) => dispatch(push2History(node)),
    removeUndoNode: () => dispatch(removeUndoNode()),
    editCategory: (node) => dispatch(editCategory(node)),
    deleteCategoryPermanently: (node) => dispatch(deleteCategory(node)),
    resetFakeDeleting: () => dispatch(resetFakeDeleting()),
    resetUnDeleting: () => dispatch(resetUnDeleting()),
    resetDeleting: () => dispatch(resetDeleting()),
    resetAdding: () => dispatch(resetAdding()),
});

export default connect(mapStateToProps,mapDispatchToProps)(TreeView);