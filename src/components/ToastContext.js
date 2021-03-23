import React, { createContext, useState, useEffect } from 'react';
import { Toast } from 'react-bootstrap';

const TOAST_TIMEOUT = 6000;
const TOAST_MAX_COUNT = 6;

export const ToastContext = createContext();

export const ToastProvider = props => {
  const [toastCount, setToastCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [idToDelete, setIdToDelete] = useState(null);

  // Look for a change in id
  useEffect(() => {
    setToasts(toasts.filter(toast => toast.key !== idToDelete));
  }, [idToDelete]);

  const createToast = (id, title, text, caption) => {
    return (<Toast key={id} onClose={() => setIdToDelete(id)} show={true}>
      <Toast.Header>
        <strong className="mr-auto">{title}</strong>
        <small>{caption}</small>
      </Toast.Header>
      <Toast.Body>{text}</Toast.Body>
    </Toast>);
  }

  const addToast = (title, text, caption) => {
    if (toasts.length >= TOAST_MAX_COUNT) {
      const oldestId = toasts[0].key;
      setIdToDelete(oldestId);
    }

    const nextId = `toast_${toastCount}`;
    const toast = createToast(nextId, title, text, caption);
    setToasts([...toasts, toast]);
    setToastCount(toastCount + 1);
    setTimeout(() => {
      setIdToDelete(nextId);
    }, TOAST_TIMEOUT);
  }

  return (
    <ToastContext.Provider
      value={[toasts, addToast]}>
      {props.children}
    </ToastContext.Provider>);
}