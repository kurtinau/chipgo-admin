import React from 'react';
import {ToastContainer} from "react-toastify";

const MyToast = () => {
    return (
        <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnVisibilityChange
            pauseOnFocusLoss
            draggable
            pauseOnHover
        />
    );
};

export default MyToast;