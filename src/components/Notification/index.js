import React, {Fragment} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import MyPortal from "../Portal";
import MyModal from "./Modal";
import MyToast from "./Toastify";
import 'react-toastify/dist/ReactToastify.min.css';


const Notification = () => {
    const dispatch = useDispatch();

    // const modals = useSelector(state => state.notification.modals);

    // const toasts = useSelector(state => state.notification.toasts);

    // const renderModals = modals.map((item, i) => <MyPortal key={i}><MyModal/></MyPortal>);

    // const renderToasts = toasts.map((item, i) => <MyPortal key={modals.length + i}><MyToast/></MyPortal>);

    return (
        <Fragment>
            <MyPortal><MyModal/></MyPortal>
            <MyToast/>
        </Fragment>
    );
};

export default Notification;