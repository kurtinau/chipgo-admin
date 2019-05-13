import React, {Component} from 'react';
import SortableTree, {
    addNodeUnderParent,
    changeNodeAtPath, find,
    getTreeFromFlatData,
    removeNodeAtPath
} from 'react-sortable-tree';
import 'react-sortable-tree/style.css';
import {Button, Col, Input, Row} from "reactstrap";
import {AppSwitch} from '@coreui/react';
import {findIdByFields, isEmpty} from "../../../../util";
import Dialog from "../../../Dialog";

const getNodeKey = ({treeIndex}) => treeIndex;

export default class TreeView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            treeData: getTreeFromFlatData({
                flatData: this.props.categories.map((node, index) => node.isDeleted !== 1 ? {
                    ...node,
                    index: index
                } : undefined).filter(x => x),
                getKey: node => node.id, // resolve a node's key
                getParentKey: node => node.parentId, // resolve a node's parent's key
                rootKey: 0,
            }),
            checked: false,
        };
    }

    addDeletedCategories(deletedCategories) {
        let newTreeData = this.state.treeData;
        deletedCategories.forEach(category => {
            if (category.parentId === 0) {
                newTreeData = newTreeData.concat(category);
            } else {
                const matches = this.searchNode(newTreeData, category.parentId);
                if (matches.length > 0) {
                    const path = matches[0].path;
                    newTreeData = addNodeUnderParent({
                        treeData: newTreeData,
                        parentKey: path[path.length - 1],
                        expandParent: true,
                        getNodeKey,
                        newNode: category,
                        addAsFirstChild: true,
                    }).treeData
                }
            }
        });
        return newTreeData;
    }

    removeDeletedCategories(deletedCategories) {
        let newTreeData = this.state.treeData;
        deletedCategories.forEach(category => {
            const matches = this.searchNode(newTreeData, category.id);
            if (matches.length > 0) {
                const path = matches[0].path;
                newTreeData = removeNodeAtPath({
                    treeData: newTreeData,
                    path,
                    getNodeKey,
                });
            }
        });
        return newTreeData;
    }

    checkIfAnyDeletedCategoriesEditing() {
        let editing = false;
        const {originalNodesByEditedNodes} = this.props;
        if (originalNodesByEditedNodes.length > 0) {
            for (let i = 0; i < originalNodesByEditedNodes.length; i++) {
                if (originalNodesByEditedNodes[i].isDeleted === 1) {
                    editing = true;
                    break;
                }
            }
        }
        return editing;
    }

    checkIfAnyCategoriesRemoved() {
        let removed = false;
        const {editedNodes, originalNodesByEditedNodes} = this.props;
        if (editedNodes.length > 0) {
            for (let i = 0; i < editedNodes.length; i++) {
                const editedNode = editedNodes[i];
                if (editedNode.isDeleted === 1 && originalNodesByEditedNodes[i].isDeleted === 0) {
                    removed = true;
                    break;
                }
            }
        }
        return removed;
    }

    showDeletedCategories(e) {
        let checked = e.target.checked;
        const deletedCategories = this.props.categories.map((node, index) => node.isDeleted === 1 ? {
            ...node,
            index: index
        } : undefined).filter(x => x);
        let newTreeData = [...this.state.treeData];
        if (checked) {
            if (this.checkIfAnyCategoriesRemoved()) {
                this.dialog.showAlert('Please submit or undo delete change first...');
                checked = !checked;
            } else {
                newTreeData = this.addDeletedCategories(deletedCategories);
            }

        } else {
            if (this.checkIfAnyDeletedCategoriesEditing()) {
                this.dialog.showAlert('Please submit or undo change first before you hide deleted categories...');
                checked = !checked;
            } else {
                newTreeData = this.removeDeletedCategories(deletedCategories);
            }
        }
        e.target.checked = checked;
        this.setState({
            treeData: newTreeData,
            checked: checked,
        });
    }

    searchNode(treeData, searchQuery) {
        const customSearchById = ({node, searchQuery}) => {
            return node.id === searchQuery;

        };
        return find({
            getNodeKey,
            treeData: treeData,
            searchQuery: searchQuery,
            searchMethod: customSearchById,
        }).matches;
    }

    addMoreNode(newNode, treeData) {
        const newTreeData = treeData.concat(newNode);
        this.setState({
            treeData: newTreeData,
        });
    }

    handleUndoRemoving(undoNode) {
        const {treeData} = this.state;
        const newUndoNode = {...undoNode, isDeleted: 0};
        delete newUndoNode['source'];
        if (undoNode.parentId === 0) {
            this.addMoreNode(newUndoNode, treeData);
        } else {
            //find parent node
            const matches = this.searchNode(treeData, undoNode.parentId);
            if (matches.length > 0) {
                const path = matches[0].path;
                this.setState(state => ({
                    treeData: addNodeUnderParent({
                        treeData: state.treeData,
                        parentKey: path[path.length - 1],
                        expandParent: true,
                        getNodeKey,
                        newNode: newUndoNode,
                        addAsFirstChild: true,
                    }).treeData,
                }));
            }
        }
    }

    handleUndoEditing(undoNode) {
        const {treeData} = this.state;
        const {originalNode} = this.props;
        const matches = this.searchNode(treeData, undoNode.id);
        const path = matches[0].path;
        let newNode = {...matches[0].node};

        switch (undoNode.source) {
            case 'editing':
                newNode = {...newNode, name: originalNode.name};
                break;
            case 'undelete':
                newNode = {...newNode, isDeleted: originalNode.isDeleted, deletable: true};
                break;
            default:
                if (originalNode.isDeleted === 1 && undoNode.isDeleted === 1) {
                    newNode = {...newNode, ...undoNode, deletable: true};
                } else
                    newNode = {...newNode, ...undoNode};
                break;
        }
        delete newNode['source'];
        this.setState(state => ({
            treeData: changeNodeAtPath({
                treeData: state.treeData,
                path,
                getNodeKey,
                newNode: newNode,
            }),
        }));
    }

    handleUndoMoving(undoNode) {
        const {treeData} = this.state;
        const {originalNode} = this.props;
        //remove node first, then put it back to original position
        const matches = this.searchNode(treeData, undoNode.id);
        const path = matches[0].path;
        const treeDataAfterRemove = removeNodeAtPath({
            treeData: this.state.treeData,
            path,
            getNodeKey,
        });

        //after remove it, put it back to original position
        const originalParentId = originalNode.parentId;
        const newUndoNode = {...matches[0].node, ...undoNode, parentId: originalParentId};
        delete newUndoNode['source'];
        if (originalParentId === 0) {
            this.addMoreNode(newUndoNode, treeDataAfterRemove);
        } else {
            //find parent node
            const matchParentMatches = this.searchNode(treeDataAfterRemove, originalParentId);
            const parentPath = matchParentMatches[0].path;
            this.setState(() => ({
                treeData: addNodeUnderParent({
                    treeData: treeDataAfterRemove,
                    parentKey: parentPath[parentPath.length - 1],
                    expandParent: true,
                    getNodeKey,
                    newNode: newUndoNode,
                    addAsFirstChild: true,
                }).treeData,
            }));
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const {undoNode, originalNode, fakeDeleting, unDeleting} = this.props;
        if (!isEmpty(undoNode) && prevProps.undoNode !== undoNode) {
            console.log('update after undo click');
            if (undoNode.source === 'removing') {
                this.handleUndoRemoving(undoNode);
            } else if (undoNode.source === 'editing' || undoNode.source === 'undelete') {
                this.handleUndoEditing(undoNode);
            } else if (undoNode.source === 'moving') {
                this.handleUndoMoving(undoNode);
            } else if (/cancel/.test(undoNode.source)) {
                if (undoNode.id > 0) {
                    const newUndoNode = {...originalNode, source: undoNode.source};
                    const removingFlag = (undoNode.isDeleted === 1 && originalNode.isDeleted === 0);
                    const movingFlag = undoNode.parentId !== originalNode.parentId;
                    const editingFlag = undoNode.name !== originalNode.name;
                    const undeleteFlag = (undoNode.isDeleted === 0 && originalNode.isDeleted === 1);
                    if (removingFlag) {
                        this.handleUndoRemoving(newUndoNode);
                    } else if (movingFlag) {
                        this.handleUndoMoving(newUndoNode);
                    } else if (editingFlag || undeleteFlag) {
                        this.handleUndoEditing(newUndoNode);
                    }
                } else {
                    //when new added node doesn't to be removed, need remove it.
                    if (undoNode.isDeleted !== 1) {
                        //remove node
                        const matches = this.searchNode(this.state.treeData, undoNode.id);
                        const path = matches[0].path;
                        this.setState(state => ({
                            treeData: removeNodeAtPath({
                                treeData: state.treeData,
                                path,
                                getNodeKey,
                            }),
                        }));
                    }
                }
            }
            this.props.removeUndoNode();
        } else if ((prevProps.fakeDeleting === 0) && (fakeDeleting !== 0)) {
            console.log('fake deleting');
            //when fake delete category
            if (this.state.checked) {
                const nodes = this.props.categories.filter(node => node.id === fakeDeleting);
                const newNode = nodes[0];
                if (newNode.parentId != 0) {
                    const matches = this.searchNode(prevState.treeData, newNode.parentId);
                    const path = matches[0].path;
                    this.setState({
                        treeData: addNodeUnderParent({
                            treeData: prevState.treeData,
                            parentKey: path[path.length - 1],
                            expandParent: true,
                            getNodeKey,
                            newNode: newNode,
                            addAsFirstChild: true,
                        }).treeData,
                    });
                } else {
                    this.addMoreNode(newNode, prevState.treeData);
                }
            }
            this.props.resetFakeDeleting();
        } else if ((prevProps.unDeleting === 0) && (unDeleting !== 0)) {
            console.log('undeleting');
            //when unDeleting success, find node and update it, and set deletable true
            const matches = this.searchNode(prevState.treeData, unDeleting);
            const newNode = {...matches[0].node, isDeleted: 0, deletable: true};
            if (matches.length > 0) {
                const path = matches[0].path;
                this.setState({
                    treeData: changeNodeAtPath({
                        treeData: prevState.treeData,
                        path,
                        getNodeKey,
                        newNode: newNode,
                    }),
                });
                this.props.resetUnDeleting();
            }

        } else if (prevProps.categories.length > this.props.categories.length) {
            console.log('delete category permanently');
            //after deleting category permanently, need find node and remove it
            const deletedId = this.props.deleting;
            const matches = this.searchNode(prevState.treeData, deletedId);
            if (matches.length > 0) {
                const path = matches[0].path;
                this.setState({
                    treeData: removeNodeAtPath({
                        treeData: prevState.treeData,
                        path,
                        getNodeKey,
                    }),
                });
                this.props.resetDeleting();
            }

        } else if (prevProps.categories.length < this.props.categories.length) {
            console.log('add new category');
            //after add new category, need update the new node's id
            const addingId = this.props.adding;
            const matches = this.searchNode(prevState.treeData, addingId);
            if (matches.length > 0) {
                const path = matches[0].path;
                let newNode = {...matches[0].node};
                delete newNode.id;
                const originalId = findIdByFields(this.props.categories, newNode);
                newNode = {...newNode, id: originalId};
                this.setState({
                    treeData: changeNodeAtPath({
                        treeData: prevState.treeData,
                        path,
                        getNodeKey,
                        newNode: newNode,
                    }),
                });
                this.props.resetAdding();
            }
        }
    }

    makeEditable(node, path) {
        const prevNode = this.props.editingNode;
        if (prevNode.id !== node.id) {
            this.props.setNodeEditing(node.id);
        }

    }

    deleteNode(node, path) {
        if (node.isDeleted === 1) {
            this.dialog.show({
                body: 'Delete \<\strong>' + node.name + '</strong> permanently?',
                actions: [
                    Dialog.CancelAction(),
                    Dialog.OKAction(() => {
                        this.props.deleteCategoryPermanently(node)
                    })
                ]
            });
        } else {
            const newNode = {...node, isDeleted: 1};
            if (newNode.id === this.props.editingNode.id)
                this.props.setNodeEditing(0);
            this.props.push2History(newNode);
            this.setState(state => ({
                treeData: removeNodeAtPath({
                    treeData: state.treeData,
                    path,
                    getNodeKey,
                }),
            }));
        }

    }

    addChild(node, path) {
        if (typeof node.deletable === 'undefined' || node.deletable) {
            const newNode = {id: this.props.latestNewAddId, name: '', parentId: node.id, isDeleted: 0};
            this.props.push2History(newNode);
            this.props.setNodeEditing(newNode.id);
            // newNode.title = '';
            this.setState(state => ({
                treeData: addNodeUnderParent({
                    treeData: state.treeData,
                    parentKey: path[path.length - 1],
                    expandParent: true,
                    getNodeKey,
                    newNode: newNode,
                    addAsFirstChild: true,
                }).treeData,
            }));
        } else {
            this.dialog.showAlert('You have to submit or undo undelete before add child category...');
            // alert('You have to submit undelete before add child category...');
        }

    }

    unDeleteNode(node, path) {
        const newNode = {...node, isDeleted: 0, deletable: false};
        const pureNewNode = {...newNode};
        delete pureNewNode.children;
        delete pureNewNode.expanded;
        this.props.push2History(pureNewNode);
        this.setState(state => ({
            treeData: changeNodeAtPath({
                treeData: state.treeData,
                path,
                getNodeKey,
                newNode: newNode,
            }),
        }));
    }

    addRootNode() {
        const newNode = {id: this.props.latestNewAddId, name: '', parentId: 0, isDeleted: 0};
        this.props.push2History(newNode);
        this.props.setNodeEditing(newNode.id);
        this.setState(state => ({
            treeData: state.treeData.concat(newNode),
        }));
    }

    generateNodeButtonsProps(node, path) {
        const editButton =
            <Button color="link" className="p-1 m-0" onClick={(e) => {
                e.stopPropagation();
                this.makeEditable(node, path)
            }}>
                <i className="fa fa-pencil"/>
            </Button>;
        const addButton =
            <Button color="link" className="p-1 m-0" onClick={(e) => {
                e.stopPropagation();
                this.addChild(node, path)
            }}>
                <i className="fa fa-plus"/>
            </Button>;
        const deletable = node.deletable;
        const deleteButton = ((typeof deletable === 'undefined') || deletable) ?
            (<Button color="link" className="p-1 m-0" onClick={(e) => {
                e.stopPropagation();
                this.deleteNode(node, path)
            }}>
                <i className="fa fa-close"/>
            </Button>) : null;
        const unDeleteButton =
            <Button color="link" className="p-1 m-0" onClick={(e) => {
                e.stopPropagation();
                this.unDeleteNode(node, path)
            }}>
                <i className="fa fa-undo"/>
            </Button>;

        if (node.isDeleted === 1) {
            if (node.children && node.children.length > 0) {
                return [unDeleteButton, editButton];
            } else {
                return [unDeleteButton, editButton, deleteButton];
            }
        } else if (node.children && node.children.length > 0)
            return [addButton, editButton];
        return [addButton, editButton, deleteButton];
    }

    handleNodeMoved(nextParentNode, node, path, getNodeKey) {
        let nextParentNodeId = 0;
        if (nextParentNode !== null) {
            nextParentNodeId = nextParentNode.id;
        }
        if (nextParentNodeId !== node.parentId) {
            const newNode = {...node, parentId: nextParentNodeId};
            let newNodeWithoutChildren = {...newNode};
            delete newNodeWithoutChildren.children;
            delete newNodeWithoutChildren.expanded;
            this.props.push2History(newNodeWithoutChildren);
            this.setState(state => ({
                treeData: changeNodeAtPath({
                    treeData: state.treeData,
                    path,
                    getNodeKey,
                    newNode: newNode,
                }),
            }));
        }
    }


    render() {
        const {editingNode, categories} = this.props;
        const recordCall = (name, args) => {
            // eslint-disable-next-line no-console
            // console.log(`${name} called with arguments:`, args);
        };
        const canDrop = ({node, nextParent, prevPath, nextPath}) => {
            if (nextParent === null) {
                // console.log('next parent null, can drop');
                return true;
            } else if (categories[nextParent.index].isDeleted === 1) {
                if (node.isDeleted === 1) {
                    // console.log('node deleted, and parent deleted, can drop');
                    return true;
                }
                // console.log('next parent is deleted, cannot drop');
                return false;
            }
            return true;
        };

        return (
            <div>
                <Row>
                    <Col>
                        <Button block color="secondary" onClick={() => this.addRootNode()}>Add More</Button>
                    </Col>
                    <Col>
                        <Row>
                            <AppSwitch className={'mx-1'} label color={'info'}
                                       onClick={(e) => this.showDeletedCategories(e)}/><p>Show Deleted Categories</p>
                        </Row>
                    </Col>
                </Row>
                <div style={{height: 966}}>
                    <SortableTree
                        treeData={this.state.treeData}
                        onChange={treeData => this.setState({treeData})}
                        canDrop={canDrop}
                        onMoveNode={args => {
                            recordCall('onMoveNode', args);
                            const {nextParentNode, node, path} = args;
                            this.handleNodeMoved(nextParentNode, node, path, getNodeKey);
                        }}
                        generateNodeProps={({node, path}) => {
                            const boxStyle = node.isDeleted === 1 ? {boxShadow: `0 0 0 4px red`} : null;
                            return {
                                style: boxStyle,
                                buttons: this.generateNodeButtonsProps(node, path),
                                title: (
                                    <Input
                                        disabled={editingNode.id !== node.id}
                                        style={{fontSize: '1.1rem'}}
                                        value={node.name}
                                        onChange={event => {
                                            const name = event.target.value;
                                            const newNode = {...node, name};
                                            let newNodeWithoutChildren = {...newNode};
                                            delete newNodeWithoutChildren.children;
                                            delete newNodeWithoutChildren.expanded;
                                            this.props.push2History(newNodeWithoutChildren);
                                            this.setState(state => ({
                                                treeData: changeNodeAtPath({
                                                    treeData: state.treeData,
                                                    path,
                                                    getNodeKey,
                                                    newNode: newNode,
                                                }),
                                            }));
                                        }}
                                    />
                                ),
                            };
                        }}
                    />
                </div>
                <Dialog ref={(el) => {
                    this.dialog = el
                }}/>
            </div>

        );
    }

}