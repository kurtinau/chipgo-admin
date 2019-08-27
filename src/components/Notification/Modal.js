import React, {useState, useEffect, Fragment} from 'react';
import ReactDOM from 'react-dom';
import {useSelector, useDispatch} from 'react-redux';
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import {hideModal} from "../../actions/Notification";
import {isUndefined} from "lodash";
import MyPortal from "../Portal";


const MyModal = () => {
    const dispatch = useDispatch();
    const isOpen = useSelector(state => state.notification.isOpen);
    const className = useSelector(state => state.notification.className);
    const title = useSelector(state => state.notification.title);
    const content = useSelector(state => state.notification.content);
    const type = useSelector(state => state.notification.type);
    const onConfirm = useSelector(state => state.notification.onConfirm);
    const clickConfirm = () => {
        if (!isUndefined(onConfirm)) {
            onConfirm();
            toggle();
        }
    };
    const toggle = () => dispatch(hideModal());
    return (
        <Modal isOpen={isOpen} toggle={toggle}
               className={className}>
            <ModalHeader toggle={toggle}>{title}</ModalHeader>
            <ModalBody>
                {content}
            </ModalBody>
            <ModalFooter>
                {
                    ('modal' === type) ?
                        <Button color="primary" onClick={toggle}>Ok</Button>
                        :
                        <Fragment>
                            <Button color="primary" onClick={clickConfirm}>Ok</Button>{' '}
                            <Button color="secondary" onClick={toggle}>Cancel</Button>
                        </Fragment>
                }
            </ModalFooter>
        </Modal>
    );
};

export default MyModal;