import React, {Component} from 'react';
import {
    Badge, Button,
    Col,
    ListGroup,
    ListGroupItem,
    Row,
    UncontrolledCollapse
} from "reactstrap";
import {arrayIsEmpty} from "../../../../util";
import Dialog from "../../../Dialog/index";
import ButtonGroup from "reactstrap/es/ButtonGroup";

export default class RevisionHistory extends Component {

    showAlertModal(bodyText) {
        this.dialog.showAlert(bodyText);
    }

    showSubmitConfirm(node) {
        this.dialog.show({
            body: 'Submit Changes?',
            actions: [
                Dialog.CancelAction(),
                Dialog.OKAction(() => {
                    this.props.editCategory(node)
                })
            ]
        });
    }

    showDismissConfirm(nodeWithSource) {
        this.dialog.show({
            body: 'Dismiss change?',
            actions: [
                Dialog.CancelAction(),
                Dialog.Action(
                    'Dismiss',
                    () => {
                        this.props.push2Undo(nodeWithSource)
                    },
                    'primary'
                ),
            ],
        });
    }

    checkIfParentDeleted(nodeWithSource, compareNodes, parentObj) {
        let modalToggle = false;
        if (compareNodes.length > 0) {
            if (compareNodes[0].id > 0) {
                // when compareNodes is editing node, need check if has parent and is deleted
                for (let i = 0; i < compareNodes.length; i++) {
                    const compareNode = compareNodes[i];
                    if ((nodeWithSource.parentId === compareNode.id) && (compareNode.isDeleted === 1)) {
                        parentObj.parentName = compareNode.name;
                        modalToggle = true;
                        break;
                    }
                }
            } else {
                //when compareNodes is new added node, just only need check if has parent or not
                for (let i = 0; i < compareNodes.length; i++) {
                    const compareNode = compareNodes[i];
                    if (nodeWithSource.parentId === compareNode.id) {
                        parentObj.parentName = compareNode.name;
                        modalToggle = true;
                        break;
                    }
                }
            }
        }
        return modalToggle;
    }

    checkParentInEditedNodes(nodeWithSource, parentObj) {
        const {editedNodes} = this.props;
        let result = false;
        if (editedNodes.length > 0) {
            result = this.checkIfParentDeleted(nodeWithSource, editedNodes, parentObj);
        }
        return result;
    }

    checkParentInNewAddedNodes(nodeWithSource, parentObj) {
        const {newNodes} = this.props;
        let result = false;
        if (newNodes.length > 0) {
            result = this.checkIfParentDeleted(nodeWithSource, newNodes, parentObj);
        }
        return result;
    }

    checkParentInCategories(nodeWithSource, parentObj, parentCategory) {
        parentObj.parentName = parentCategory.name;
        return parentCategory.isDeleted === 1;
    }

    checkIfChildrenIsDeleted(nodeWithSource, compareNodes, childObj, index) {
        let modalToggle = false;
        const childNodes = this.props.childNodesByEditedNodes[index];
        if (childNodes.length > 0) {
            //when have children in original category list, check if has any child that is not deleted
            for (let i = 0; i < childNodes.length; i++) {
                if (childNodes[i].isDeleted === 0) {
                    modalToggle = true;
                    childObj.childName = childNodes[i].name;
                    break;
                }
            }
        } else {
            //when don't have children, check if editing list has any child that is waiting to submit deletion
            for (let i = 0; i < compareNodes.length; i++) {
                if (nodeWithSource.id === compareNodes[i].parentId) {
                    modalToggle = true;
                    childObj.childName = compareNodes[i].name;
                    break;
                }
            }
        }
        return modalToggle;
    }


    checkChildrenInEditedNodes(nodeWithSource, childObj, index) {
        const {editedNodes} = this.props;
        let result = false;
        if (editedNodes.length > 0) {
            result = this.checkIfChildrenIsDeleted(nodeWithSource, editedNodes, childObj, index);
        }
        return result;
    }

    checkChildrenInNewAddedNodes(nodeWithSource, childObj, index) {
        const {newNodes} = this.props;
        let result = false;
        if (newNodes.length > 0) {
            result = this.checkIfChildrenIsDeleted(nodeWithSource, newNodes, childObj, index);
        }
        return result;
    }

    checkNameConflictWithSiblings(node) {
        let result = false;
        const siblings = this.props.siblingsByEditedAndNewAddedNodes[node.id];
        for (let i = 0; i < siblings.length; i++) {
            const sibling = siblings[i];
            if (sibling.name === node.name) {
                result = true;
                break;
            }
        }
        return result;
    }

    handelCancelAll(node, renderDetails, index) {
        let nodeWithSource = {...node, source: 'cancel'};
        if (node.id < 0) {
            //cancel new added node, just push to undo store, reducer will delete it
            this.dialog.show({
                body: 'Dismiss add new category?',
                actions: [
                    Dialog.CancelAction(),
                    Dialog.Action(
                        'Dismiss',
                        () => {
                            this.props.push2Undo(nodeWithSource)
                        },
                        'primary'
                    ),
                ],
            });
        } else {
            if (renderDetails.hasOwnProperty('removing')) {
                this.handelUndo('cancel_removing', node, index);
            } else if (renderDetails.hasOwnProperty('undelete')) {
                this.handelUndo('cancel_undelete', node, index);
            } else {
                this.handelUndo('cancel', node, index);
            }
        }
    }

    handelUndo(keyName, node, index) {
        const nodeWithSource = {...node, source: keyName};
        if (node.id > 0) {
            let modalToggle = false;
            if (keyName === 'removing' || keyName === 'cancel_removing') {
                //when undo removing, make sure parent is not removed
                let parentObj = {parentName: ''};
                modalToggle = this.checkParentInEditedNodes(nodeWithSource, parentObj);
                if (!modalToggle)
                    this.showDismissConfirm(nodeWithSource);
                else {
                    const bodyText = 'Cannot undo \<\strong>' + node.name + ' </strong> due to its parent <strong>' + parentObj.parentName + '</strong> has been removed. Please undo its parent first...';
                    this.showAlertModal(bodyText);
                }
            } else if (keyName === 'undelete' || keyName === 'cancel_undelete') {
                //check if it has children that have not been deleted
                let childObj = {childNodeName: ''};
                modalToggle = this.checkChildrenInEditedNodes(nodeWithSource, childObj, index) || this.checkChildrenInNewAddedNodes(nodeWithSource, childObj, index);
                if (modalToggle) {
                    const bodyText = 'Cannot undo undelete \<\strong>' + node.name + ' </strong> due to its child <strong>' + childObj.childNodeName + '</strong> has not been deleted...';
                    this.showAlertModal(bodyText);
                } else {
                    this.showDismissConfirm(nodeWithSource);
                }
            } else {
                this.showDismissConfirm(nodeWithSource);
            }
        } else {
            // when new added node undo button clicked, only undo removing
            //check parent in category list
            //check parent in editing list
            //check parent in newAdd list
            let parentObj = {parentName: ''};
            const parentCategory = this.props.parentNodesByNewAddedNodes[index];
            const alertFlag = this.checkParentInCategories(node, parentObj, parentCategory) || this.checkParentInEditedNodes(node, parentObj) || this.checkParentInNewAddedNodes(node, parentObj);
            if (alertFlag) {
                const bodyText = 'Cannot undo \<\strong>' + node.name + ' </strong> due to its parent <strong>' + parentObj.parentName + '</strong> has been removed.';
                this.showAlertModal(bodyText);
            } else {
                this.showDismissConfirm(nodeWithSource);
            }
        }
    }

    handelSubmitAll(node, renderDetails, index) {
        if (node.id < 0) {
            //when add new node
            if (node.isDeleted === 1) {
                //when new node has been removed, just show alert and delete new added node
                this.dialog.show({
                    body: 'The new category \<\strong>' + node.name + '</strong> won\'t submit to server due to you have removed it, Would you like to continue? ',
                    actions: [
                        Dialog.CancelAction(),
                        Dialog.Action(
                            'Continue',
                            () => {
                                this.props.push2Undo({...node, source: 'cancel'});
                            },
                            'primary'
                        ),
                    ],
                });
            } else {
                //when add new node, need to check if its parent is deleted
                //check original category list
                //check new added list
                //check editing list
                if (node.name.trim() !== '') {
                    node.name = node.name.trim();
                    if (!this.checkNameConflictWithSiblings(node)) {
                        let parentObj = {parentName: ''};
                        const parentCategory = this.props.parentNodesByNewAddedNodes[index];
                        const alertFlag = this.checkParentInCategories(node, parentObj, parentCategory) || this.checkParentInEditedNodes(node, parentObj);
                        if (alertFlag) {
                            const bodyText = 'Cannot add new category \<\strong>' + node.name + ' </strong> due to its parent <strong>' + parentObj.parentName + '</strong> has been deleted.';
                            this.showAlertModal(bodyText);
                        } else if (this.checkParentInNewAddedNodes(node, parentObj)) {
                            const bodyText = 'Cannot add new category \<\strong>' + node.name + ' </strong> due to its parent <strong>' + parentObj.parentName + '</strong> is new category, you must submit parent first.';
                            this.showAlertModal(bodyText);
                        } else {
                            this.dialog.show({
                                body: 'Add new category?',
                                actions: [
                                    Dialog.CancelAction(),
                                    Dialog.OKAction(() => {
                                        this.props.addCategory(node);
                                    }),
                                ],
                            });
                        }
                    } else {
                        const bodyText = 'The category name cannot be same with other siblings\'!';
                        this.showAlertModal(bodyText);
                    }
                } else {
                    this.showAlertModal('The category name cannot be empty!');
                }

            }
        } else {
            if (renderDetails.hasOwnProperty('removing')) {
                this.handelSubmit('all_removing', node, index);
            } else if (renderDetails.hasOwnProperty('undelete')) {
                this.handelSubmit('all_undelete', node, index);
            } else {
                this.handelSubmit('all', node, index);
            }
        }
    }

    handelSubmit(keyName, node, index) {
        if (node.id > 0) {
            let newNode = {id: node.id};
            switch (keyName) {
                case 'removing':
                    newNode = {...newNode, isDeleted: 1};
                    break;
                case 'moving':
                    newNode = {...newNode, parentId: node.parentId};
                    break;
                case 'editing':
                    newNode = {...newNode, name: node.name.trim()};
                    break;
                case 'undelete':
                    newNode = {...newNode, isDeleted: 0};
                    break;
                default:
                    newNode = {...newNode, name: node.name.trim(), parentId: node.parentId, isDeleted: node.isDeleted};
                    break;
            }
            if (newNode.name !== '') {
                if (!this.checkNameConflictWithSiblings(newNode)) {
                    if (keyName === 'undelete' || keyName === 'all_undelete') {
                        //check if parent(find from original category list) is deleted, if deleted show alert message to prevent submission.

                        let parentObj = {parentName: ''};
                        //check original categories list or editing history list
                        const parentCategory = this.props.parentNodesByEditedNodes[index];
                        const alertFlag = this.checkParentInCategories(newNode, parentObj, parentCategory) || this.checkParentInEditedNodes(newNode, parentObj);
                        if (alertFlag) {
                            const bodyText = 'Cannot undelete \<\strong>' + node.name + ' </strong> due to its parent <strong>' + parentObj.parentName + '</strong> has been deleted. Please undelete its parent first...';
                            this.showAlertModal(bodyText);
                        } else {
                            this.showSubmitConfirm(newNode);
                        }
                    } else if (keyName === 'removing' || keyName === 'all_removing') {
                        //when submit node removing, have to check if its child is deleted
                        // (due to child move to other position, then you can access remove button)
                        //according to original categories list, find real children and check if they are deleted
                        let childObj = {childName: ''};
                        const alertFlag = this.checkChildrenInEditedNodes(newNode, childObj, index);
                        if (alertFlag) {
                            //if child is not deleted
                            const bodyText = 'Cannot delete \<\strong>' + node.name + ' </strong> due to it has child <strong>' + childObj.childName + '</strong> that is not deleted. If you removed the child, please submit it first.';
                            this.showAlertModal(bodyText);
                        } else {
                            this.showSubmitConfirm(newNode);
                        }
                    } else {
                        this.showSubmitConfirm(newNode);
                    }
                } else {
                    const bodyText = 'The category name cannot be same with other siblings\'!';
                    this.showAlertModal(bodyText);
                }
            } else {
                const bodyText = 'The category name cannot be empty!';
                this.showAlertModal(bodyText);
            }
        } else {
            //when add new node, toggle detail don't have submit button
        }
    }

    renderToggle(toggleId, renderDetails, disableIcon, node, index) {
        return (
            <UncontrolledCollapse toggler={toggleId} className="pt-2 pb-0">
                <ListGroup>
                    {Object.keys(renderDetails).map((keyName, detailsIndex) => (
                        <ListGroupItem className="p-1" key={detailsIndex}>
                            <Row>
                                <Col className="col-10 my-auto">
                                    <div>
                                        {renderDetails[keyName]}
                                    </div>
                                </Col>
                                <Col className="col-2">
                                    <div className="float-right">
                                        <ButtonGroup>
                                            {
                                                (node.id < 0 && node.isDeleted === 1) ? null :
                                                    (
                                                        <Button color="link" className="pr-1" onClick={(e) => {
                                                            e.stopPropagation();
                                                            this.handelSubmit(keyName, node, index);
                                                        }} disabled={(disableIcon && keyName !== 'removing')}>
                                                            <i className="fa fa-check"/>
                                                        </Button>
                                                    )
                                            }
                                            <Button color="link" className="pl-1 py-1" onClick={(e) => {
                                                e.stopPropagation();
                                                this.handelUndo(keyName, node, index);
                                            }} disabled={(disableIcon && keyName !== 'removing')}>
                                                <i className="fa fa-undo"/>
                                            </Button>
                                        </ButtonGroup>
                                    </div>
                                </Col>
                            </Row>
                        </ListGroupItem>
                    ))}
                </ListGroup>
            </UncontrolledCollapse>
        );
    }

    renderItem(node, listItemTitle, badgeCount, renderDetails, disableIcon, index) {
        const toggleId = 'toggle' + node.id;
        return (
            <ListGroupItem className="justify-content-between" key={node.id}>
                <Row>
                    <Col className="col-11 my-auto cursor-pointer">
                        <div id={toggleId}>
                            {listItemTitle} <Badge pill>{badgeCount}</Badge>
                        </div>
                    </Col>
                    <Col className="col-1">
                        <div className="float-right">
                            <ButtonGroup>
                                <Button color="link" className="p-1" onClick={(e) => {
                                    e.stopPropagation();
                                    this.handelSubmitAll(node, renderDetails, index);
                                }}>
                                    <i className="icon-check icons font-xl"/>
                                </Button>

                                <Button color="link" className="p-1" onClick={(e) => {
                                    e.stopPropagation();
                                    this.handelCancelAll(node, renderDetails, index)
                                }}>
                                    <i className="icon-close icons font-xl"/>
                                </Button>
                            </ButtonGroup>
                        </div>
                    </Col>
                </Row>
                {((node.id < 0) && !disableIcon) ?
                    null :
                    this.renderToggle(toggleId, renderDetails, disableIcon, node, index)
                }
            </ListGroupItem>
        );
    }


    render() {
        const {editedNodes, newNodes} = this.props;

        let renderEditedHistory = null;
        let renderNewAddedHistory = null;

        let listItemTitle = null;
        if (!arrayIsEmpty(editedNodes)) {
            renderEditedHistory = (
                <ListGroup className="pt-2" onClick={e => e.stopPropagation()}>
                    {editedNodes.map((node, index) => {
                        let disableIcon = false;
                        let badgeCount = 0;
                        let renderDetails = {};
                        const originalNode = this.props.originalNodesByEditedNodes[index];
                        const parentNode = this.props.parentNodesByEditedNodes[index];
                        if (node.name !== originalNode.name) {
                            badgeCount++;
                            renderDetails['editing'] = (
                                <span>Changed name from <strong>{originalNode.name}</strong> to <strong>{node.name}</strong>.</span>);
                        }
                        if (node.parentId !== originalNode.parentId) {
                            badgeCount++;
                            renderDetails['moving'] = (
                                <span><strong>{node.name}</strong> has been moved, parent is <strong>{parentNode.name}</strong> now.</span>);
                        }
                        if (node.isDeleted === 1 && originalNode.isDeleted === 0) {
                            disableIcon = true;
                            badgeCount++;
                            renderDetails['removing'] = (<span><strong>{node.name}</strong> has been removed.</span>);
                        }
                        if (originalNode.isDeleted === 1 && node.isDeleted === 0) {
                            badgeCount++;
                            renderDetails['undelete'] = (<span><strong>{node.name}</strong> has been undeleted.</span>);
                        }
                        listItemTitle = <span><strong>{node.name}</strong> Edited </span>;
                        return this.renderItem(node, listItemTitle, badgeCount, renderDetails, disableIcon, index);
                    })}
                </ListGroup>);
        }

        if (!arrayIsEmpty(newNodes)) {
            renderNewAddedHistory = (
                <ListGroup className="pt-2" onClick={e => e.stopPropagation()}>
                    {newNodes.map((node, index) => {
                        let renderNewAddedDetails = {};
                        let disableIcon = false;
                        let badgeCount = 0;
                        const parentNodeByNewAddedNode = this.props.parentNodesByNewAddedNodes[index];
                        if (node.isDeleted === 1) {
                            disableIcon = true;
                            badgeCount++;
                            renderNewAddedDetails['removing'] = (
                                <span><strong>{node.name}</strong> has been removed.</span>);
                        }
                        listItemTitle =
                            <span>Add New Node <strong>{node.name}</strong>, the parent is <strong>{parentNodeByNewAddedNode.name}</strong></span>;
                        return this.renderItem(node, listItemTitle, badgeCount, renderNewAddedDetails, disableIcon, index);
                    })}
                </ListGroup>
            );
        }

        return (
            <div>
                {renderEditedHistory}
                {renderNewAddedHistory}
                <Dialog ref={(el) => {
                    this.dialog = el
                }}/>
            </div>
        );
    };
}