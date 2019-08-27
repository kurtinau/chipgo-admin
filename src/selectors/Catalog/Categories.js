import {getItemById, getItemsUtil} from "../util";
import {arrayIsEmpty, isEmpty} from "../../util";
import { createSelector } from 'reselect';

const getCategoriesState = store => store.catalog.categories;

const rootNode = {id: 0, name: 'Root Category', parentId: -1, isDeleted: -1};

const getCategoryById = (store, id) => {
    if (id === 0)
        return rootNode;
    return getItemById(getCategoriesState(store), id);
}


const getCategoryList = store => getCategoriesState(store) ? getCategoriesState(store).allIds : [];

const getCategoryByIds = store => getCategoriesState(store) ? getCategoriesState(store).byIds : {};

export const getCategories = createSelector(
    [getCategoryList, getCategoryByIds],
    (allIds, byIds) => {
        return allIds.map(id => byIds[id])
    }
);

// export const getCategories = store => arrayIsEmpty(getCategoryList(store)) ? [] : getCategoryList(store).map(id => getCategoryById(store, id));

const getHistoryState = store => getCategoriesState(store).revisionHistory;

const getHistoryEditedNodeById = (store, id) => getHistoryState(store).byIds[id];

const getNewAddedNodeById = (store, id) => {
    if (id === 0)
        return rootNode;
    return getHistoryState(store).newNodes.byIds[id];
};


export const getEditingNode = store => {
    const editingNodeId = getCategoriesState(store).editingId;
    if (editingNodeId === 0) {
        return {id: 0};
    } else if (editingNodeId < 0) {
        return getNewAddedNodeById(store, editingNodeId);
    } else {
        return getCategoryById(store, editingNodeId);
    }
};


//History handler

export const getEditHistoryAllIds = store => {
    const editHistoryState = getHistoryState(store);
    return editHistoryState.allIds ? editHistoryState.allIds : [];
};

export const getNewAddHistoryAllIds = store => {
    const newAddHistoryState = getHistoryState(store).newNodes;
    return newAddHistoryState.allIds ? newAddHistoryState.allIds : [];
};

export const getEditHistory = store => {
    const editHistoryState = getHistoryState(store);
    const allIds = editHistoryState.allIds;
    if (!arrayIsEmpty(allIds)) {
        const allEditNodes = getItemsUtil(editHistoryState);
        // const allEditNodesWioutDeleted = allEditNodes.filter(node => node.isDeleted === 0);
        return allEditNodes;
    } else {
        return [];
    }
};

export const getNewAddHistory = store => {
    const newAddHistoryState = getHistoryState(store).newNodes;
    const allIds = newAddHistoryState.allIds;
    if (!arrayIsEmpty(allIds)) {
        const allNewAddNodes = getItemsUtil(newAddHistoryState);
        // const allNewAddNodesWithoutDeleted = allNewAddNodes.filter(node => node.isDeleted === 0);
        // console.log('newAdd nodes: ', allNewAddNodes);
        return allNewAddNodes;
    } else {
        return [];
    }
};

export const getParentCategoriesByEdited = store => {
    const editedNodes = getEditHistory(store);
    if (isEmpty(editedNodes))
        return [];
    return editedNodes.map(node => getCategoryById(store, node.parentId));
};

export const getCategoriesByEdited = store => {
    const editedNodeAllIds = getEditHistoryAllIds(store);
    if (isEmpty(editedNodeAllIds))
        return [];
    return editedNodeAllIds.map(id => getCategoryById(store, id));
};

export const getParentNodesByNewAdded = store => {
    const newAddedNodes = getNewAddHistory(store);
    if (isEmpty(newAddedNodes))
        return [];
    return newAddedNodes.map(node => {
        if (node.parentId < 0)
            return getNewAddedNodeById(store, node.parentId);
        else
            return getCategoryById(store, node.parentId);
    });
};

export const getChildNodesByEdited = store => {
    const editedNodes = getEditHistory(store);
    if (isEmpty(editedNodes))
        return [];
    const categories = getCategories(store);
    let result = [];
    editedNodes.forEach(node => {
        let children = [];
        for (let i = 0; i < categories.length; i++) {
            if (node.id === categories[i].parentId) {
                children.push(categories[i]);
            }
        }
        result.push(children);
    });
    return result;
};

export const getNodeByUndoNodeId = (store) => {
    const undoNode = getHistoryState(store).undoNode;
    if (!isEmpty(undoNode)) {
        const id = undoNode.id;
        if (id < 0)
            return getNewAddedNodeById(store, id);
        return getCategoryById(store, id);
    } else {
        return {};
    }
};


export const getLatestNewAddNodeId = (store) => {
    const newAddHistoryState = getHistoryState(store).newNodes;
    const allIdsLength = newAddHistoryState.allIds.length;
    if (allIdsLength > 0) {
        return (newAddHistoryState.allIds[allIdsLength - 1] - 1);
    } else {
        return -1;
    }
};

export const getUndoNode = (store) => getHistoryState(store).undoNode ? getHistoryState(store).undoNode : [];

export const getFakeDeleting = (store) => getCategoriesState(store).fakeDeleting;

export const getUndeleting = (store) => getCategoriesState(store).unDeleting;

export const getDeleting = (store) => getCategoriesState(store).deleting;

export const getAdding = (store) => getCategoriesState(store).adding;

// export const getHistoryNodeByProps = (store, props) => {
//     const id = props.node.id;
//     if (id < 0)
//         return getNewAddedNodeById(store, id);
//     const result = getHistoryEditedNodeById(store, id);
//     console.log('history node by props: ', result);
//     return result;
// };
//
// export const getNodeByProps = (store, props) => {
//     // console.log('original: ', props.node);
//     const id = props.node.id;
//     if (id < 0)
//         return getNewAddedNodeById(store, id);
//     return getCategoryById(store, id);
// };
//
// export const getParentNodeByPros = (store, props) => {
//     // console.log('keyId: ', props.node);
//     const editedNode = getHistoryEditedNodeById(store, props.node.id);
//     const id = editedNode.parentId;
//     if (id < 0)
//         return getNewAddedNodeById(store, id);
//     return getCategoryById(store, id);
// };

const getCategoriesByParentId = (store, parentId) => {
    return getCategories(store).filter(category => category.parentId === parentId);
};

export const getSiblingsByEditedAndAddedNodes = (store) => {
    let result = {};
    const editedNodes = getEditHistory(store);
    const newAddedNodes = getNewAddHistory(store);
    editedNodes.forEach(node => {
        result[node.id] = getCategoriesByParentId(store, node.parentId).filter(c => c.id !== node.id);
    });
    newAddedNodes.forEach(node => {
        result[node.id] = getCategoriesByParentId(store, node.parentId).filter(c => c.id !== node.id);
    });
    return result;
};
