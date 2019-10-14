import {
    GET_CATEGORIES_SUCCESS,
    PUSH_TO_HISTORY,
    PUSH_TO_UNDO,
    SET_NODE_EDITING,
    REMOVE_UNDO_NODE,
    UPDATE_CATEGORY_SUCCESS,
    ADD_CATEGORY_SUCCESS,
    RESET_FAKE_DELETING,
    RESET_UN_DELETING,
    DELETE_CATEGORY_SUCCESS, RESET_DELETING, REST_ADDING
} from "../../../constants/Categories";
import {compareObject, compareObjectWithGivenKey} from "../../../util";

const initialState = {
    byIds: {},
    allIds: [],
    editingId: 0,
    revisionHistory: {
        byIds: {},
        allIds: [],
        newNodes: {
            byIds: {},
            allIds: [],
        },
        undoNode: {},
    },
    fakeDeleting: 0,
    unDeleting: 0,
    deleting: 0,
    adding: 0,
};

function deleteAllId(allIds, id) {
    return allIds.filter(allId => allId !== id);
}

function categoriesReducer(state = initialState, action) {
    switch (action.type) {
        case GET_CATEGORIES_SUCCESS:
            let newByIds = {};
            let newAllIds = [];
            let listData = [...action.payload.data];
            listData.forEach(data => {
                let copyData = Object.assign({}, data);
                newByIds[copyData.id] = copyData;
                newAllIds.push(copyData.id);
            });
            return {
                ...state,
                byIds: newByIds,
                allIds: newAllIds,
                revisionHistory: {...state.revisionHistory},
            };
        case SET_NODE_EDITING:
            return {
                ...state,
                byIds: {...state.byIds},
                allIds: [...state.allIds],
                editingId: action.payload,
                revisionHistory: {...state.revisionHistory},
            };
        case PUSH_TO_HISTORY:
            const history = state.revisionHistory;
            let newHistoryAllIds = [...state.revisionHistory.allIds];
            let newHistoryByIds = {...state.revisionHistory.byIds};
            let newAddHistoryAllIds = [...state.revisionHistory.newNodes.allIds];
            let newAddHistoryByIds = {...state.revisionHistory.newNodes.byIds};
            if (action.payload.id < 0) {
                if (newAddHistoryAllIds.length > 0) {
                    let nodeIndex = 0;
                    const addedNodes = history.newNodes.allIds.filter((id, index) => {
                        if (id === action.payload.id) {
                            nodeIndex = index;
                            return true;
                        }
                        return false;
                    });
                    if (addedNodes.length <= 0) {
                        newAddHistoryAllIds = [...newAddHistoryAllIds, action.payload.id];
                        newAddHistoryByIds = {...newAddHistoryByIds, [action.payload.id]: action.payload};
                    } else {
                        if (action.payload.name.trim() === '' && action.payload.isDeleted === 1) {
                            newAddHistoryAllIds.splice(nodeIndex, 1);
                            delete newAddHistoryByIds[action.payload.id];
                        } else {
                            newAddHistoryByIds = {...newAddHistoryByIds, [action.payload.id]: action.payload};
                        }
                    }
                } else {
                    newAddHistoryAllIds = [...newAddHistoryAllIds, action.payload.id];
                    newAddHistoryByIds = {...newAddHistoryByIds, [action.payload.id]: action.payload};
                }
            } else {
                let nodeIndex = 0;
                const editedNodes = history.allIds.filter((id, index) => {
                    if (id === action.payload.id) {
                        nodeIndex = index;
                        return true;
                    }
                    return false;
                });
                if (!compareObjectWithGivenKey(state.byIds[action.payload.id], action.payload, Object.keys(state.byIds[action.payload.id]))) {
                    newHistoryByIds = {...newHistoryByIds, [action.payload.id]: action.payload};
                    if (editedNodes.length <= 0) {
                        newHistoryAllIds = [...newHistoryAllIds, action.payload.id];
                    }
                } else {
                    if (editedNodes.length > 0) {
                        newHistoryAllIds.splice(nodeIndex, 1);
                        delete newHistoryByIds[action.payload.id];
                    }
                }
            }
            return {
                ...state,
                byIds: {...state.byIds},
                allIds: [...state.allIds],
                revisionHistory: {
                    byIds: newHistoryByIds,
                    allIds: newHistoryAllIds,
                    newNodes: {
                        byIds: newAddHistoryByIds,
                        allIds: newAddHistoryAllIds,
                    },
                },
            };
        case PUSH_TO_UNDO:
            return {
                ...state,
                byIds: {...state.byIds},
                allIds: [...state.allIds],
                revisionHistory: {
                    byIds: {...state.revisionHistory.byIds},
                    allIds: [...state.revisionHistory.allIds],
                    newNodes: {
                        byIds: {...state.revisionHistory.newNodes.byIds},
                        allIds: [...state.revisionHistory.newNodes.allIds],
                    },
                    undoNode: action.payload,
                },
            };
        case REMOVE_UNDO_NODE:
            let editingId = state.editingId;
            let undoNode = {...state.revisionHistory.undoNode};
            let byIds = {...state.revisionHistory.byIds};
            let allIds = [...state.revisionHistory.allIds];
            let newNodesAllIds = [...state.revisionHistory.newNodes.allIds];
            if (undoNode.id < 0) {
                byIds = {...state.revisionHistory.newNodes.byIds};
            }
            switch (undoNode.source) {
                case 'removing':
                    byIds[undoNode.id].isDeleted = 0;
                    break;
                case 'undelete':
                    byIds[undoNode.id].isDeleted = 1;
                    break;
                case 'editing':
                    byIds[undoNode.id].name = state.byIds[undoNode.id].name;
                    break;
                case 'moving':
                    byIds[undoNode.id].parentId = state.byIds[undoNode.id].parentId;
                    break;
                default:
                    //cancel all change
                    if (undoNode.id < 0) {
                        // console.log('delete add new node due to cancel');
                        newNodesAllIds = deleteAllId(newNodesAllIds, undoNode.id);
                        delete byIds[undoNode.id];
                        if (state.editingId === undoNode.id)
                            editingId = 0;
                    } else {
                        byIds[undoNode.id] = state.byIds[undoNode.id];
                    }
                    break;
            }
            // console.log('byid: ', byIds[undoNode.id]);
            if (undoNode.id > 0) {
                if (compareObjectWithGivenKey(byIds[undoNode.id], state.byIds[undoNode.id], Object.keys(state.byIds[undoNode.id]))) {
                    // console.log('delete node');
                    allIds = deleteAllId(allIds, undoNode.id);
                    delete byIds[undoNode.id];
                }
            }
            let historyByIds = {...state.revisionHistory.byIds};
            let newAddNodesByIds = {...state.revisionHistory.newNodes.byIds};
            if (undoNode.id < 0)
                newAddNodesByIds = byIds;
            else
                historyByIds = byIds;
            return {
                ...state,
                byIds: {...state.byIds},
                allIds: [...state.allIds],
                editingId: editingId,
                revisionHistory: {
                    byIds: historyByIds,
                    allIds: allIds,
                    newNodes: {
                        byIds: newAddNodesByIds,
                        allIds: newNodesAllIds,
                    },
                    undoNode: {},
                },
            };
        case UPDATE_CATEGORY_SUCCESS:
            const updatedData = action.payload.data[0];
            let fakeDeleting = state.fakeDeleting;
            let unDeleting = state.unDeleting;
            //fake delete node
            if (updatedData.isDeleted === 1 && state.byIds[updatedData.id].isDeleted === 0)
                fakeDeleting = updatedData.id;
            //undelete node success
            if (updatedData.isDeleted === 0 && state.byIds[updatedData.id].isDeleted === 1)
                unDeleting = updatedData.id;
            let editHistoryByIds = {...state.revisionHistory.byIds};
            let editHistoryAllIds = [...state.revisionHistory.allIds];
            if (editHistoryByIds[updatedData.id]) {
                if (compareObjectWithGivenKey(editHistoryByIds[updatedData.id], updatedData, Object.keys(updatedData))) {
                    delete editHistoryByIds[updatedData.id];
                    editHistoryAllIds = deleteAllId(editHistoryAllIds, updatedData.id);
                }
            }
            return {
                ...state,
                editingId: 0,
                byIds: {...state.byIds, [updatedData.id]: updatedData},
                allIds: [...state.allIds],
                revisionHistory: {
                    byIds: editHistoryByIds,
                    allIds: editHistoryAllIds,
                    newNodes: {
                        byIds: {...state.revisionHistory.newNodes.byIds},
                        allIds: [...state.revisionHistory.newNodes.allIds],
                    },
                    undoNode: {...state.revisionHistory.undoNode},
                },
                fakeDeleting: fakeDeleting,
                unDeleting: unDeleting,
            };
        case ADD_CATEGORY_SUCCESS:
            const insertedData = action.payload.data[0];
            const oldId = action.payload.data[1];
            let newNodesByIds = {...state.revisionHistory.newNodes.byIds};
            let newAddAllIds = [...state.revisionHistory.newNodes.allIds];
            delete newNodesByIds[oldId];
            newAddAllIds = deleteAllId(newAddAllIds, oldId);
            //if any new added nodes' parent is the category just added, change their parentId to a real category id
            newAddAllIds.forEach(id => {
                if (newNodesByIds[id].parentId === oldId) {
                    newNodesByIds[id].parentId = insertedData.id;
                }
            });
            return {
                ...state,
                editingId: 0,
                adding: oldId,
                byIds: {...state.byIds, [insertedData.id]: insertedData},
                allIds: [...state.allIds, insertedData.id],
                revisionHistory: {
                    byIds: {...state.revisionHistory.byIds},
                    allIds: [...state.revisionHistory.allIds],
                    newNodes: {
                        byIds: newNodesByIds,
                        allIds: newAddAllIds,
                    },
                    undoNode: {...state.revisionHistory.undoNode},
                },
            };
        case DELETE_CATEGORY_SUCCESS:
            //delete category list and editing list
            let deletedByIds = {...state.byIds};
            let deletedAllIds = [...state.allIds];
            const deletedDataId = action.payload.data.id;
            delete deletedByIds[deletedDataId];
            deletedAllIds = deleteAllId(deletedAllIds, deletedDataId);
            //delete editing list
            let deletedEditedByIds = {...state.revisionHistory.byIds};
            let deletedEditedAllIds = [...state.revisionHistory.allIds];
            if (deletedEditedAllIds.length > 0 && deletedEditedAllIds.includes(deletedDataId)) {
                delete deletedEditedByIds[deletedDataId];
                deletedEditedAllIds = deleteAllId(deletedEditedAllIds, deletedDataId);
            }
            return {
                ...state,
                editingId: deletedDataId === state.editingId ? 0 : state.editingId,
                byIds: deletedByIds,
                allIds: deletedAllIds,
                revisionHistory: {
                    byIds: deletedEditedByIds,
                    allIds: deletedEditedAllIds,
                    newNodes: {
                        byIds: {...state.revisionHistory.newNodes.byIds},
                        allIds: [...state.revisionHistory.newNodes.allIds],
                    },
                    undoNode: {...state.revisionHistory.undoNode},
                },
                deleting: deletedDataId,
            };
        case RESET_DELETING:
            return {
                ...state,
                deleting: 0,
                byIds: {...state.byIds},
                allIds: [...state.allIds],
                revisionHistory: {
                    byIds: {...state.revisionHistory.byIds},
                    allIds: [...state.revisionHistory.allIds],
                    newNodes: {
                        byIds: {...state.revisionHistory.newNodes.byIds},
                        allIds: [...state.revisionHistory.newNodes.allIds],
                    },
                    undoNode: {...state.revisionHistory.undoNode},
                },
            };
        case RESET_FAKE_DELETING:
            return {
                ...state,
                fakeDeleting: 0,
                byIds: {...state.byIds},
                allIds: [...state.allIds],
                revisionHistory: {
                    byIds: {...state.revisionHistory.byIds},
                    allIds: [...state.revisionHistory.allIds],
                    newNodes: {
                        byIds: {...state.revisionHistory.newNodes.byIds},
                        allIds: [...state.revisionHistory.newNodes.allIds],
                    },
                    undoNode: {...state.revisionHistory.undoNode},
                },
            };
        case RESET_UN_DELETING:
            return {
                ...state,
                unDeleting: 0,
                byIds: {...state.byIds},
                allIds: [...state.allIds],
                revisionHistory: {
                    byIds: {...state.revisionHistory.byIds},
                    allIds: [...state.revisionHistory.allIds],
                    newNodes: {
                        byIds: {...state.revisionHistory.newNodes.byIds},
                        allIds: [...state.revisionHistory.newNodes.allIds],
                    },
                    undoNode: {...state.revisionHistory.undoNode},
                },
            };
        case REST_ADDING:
            return {
                ...state,
                adding: 0,
                byIds: {...state.byIds},
                allIds: [...state.allIds],
                revisionHistory: {
                    byIds: {...state.revisionHistory.byIds},
                    allIds: [...state.revisionHistory.allIds],
                    newNodes: {
                        byIds: {...state.revisionHistory.newNodes.byIds},
                        allIds: [...state.revisionHistory.newNodes.allIds],
                    },
                    undoNode: {...state.revisionHistory.undoNode},
                },
            };
        default:
            return state;
    }
}


export default categoriesReducer;