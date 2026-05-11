import React, { useState } from 'react';
import ReconnectionForm from './ReconnectionForm';

const Modal = () => {
  const [open, setOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <button onClick={handleOpen}>Reconnect</button>
      {open && (
        <div>
          <h2>Reconnection Form</h2>
          <form>
            <ReconnectionForm />
          </form>
          <button onClick={handleClose}>Close</button>
        </div>
      )}
    </div>
  );
};

export default Modal;