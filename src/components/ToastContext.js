import React, { createContext, useState } from 'react'

export const ToastContext = createContext();

export const ToastProvider = props => {
    const [toasts, setToasts] = useState([]);
    return (
    <ToastContext.Provider 
        value={[toasts, setToasts]}>
            {props.children}
    </ToastContext.Provider>);
}
