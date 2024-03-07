import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './Modal.css';
import NotificationComponent from './NotificationComponent';
import NotificationsIcon from '@mui/icons-material/Notifications';

function Modal({ isOpen, toggleModal, content }) {
  const [modal, setModal] = useState(isOpen);

  useEffect(() => {
    setModal(isOpen);
  }, [isOpen]);

  useEffect(() => {
    if (modal) {
      document.body.classList.add('active-modal');
    } else {
      document.body.classList.remove('active-modal');
    }
    return () => {
      document.body.classList.remove('active-modal');
    };
  }, [modal]);

  return (
    <>
        <NotificationsIcon onClick={toggleModal} className="btn-modal" />
        {modal && (
            <div className="modal">
            <div onClick={toggleModal} className="overlay"></div>
            <div className="modal-content">
                <h2>Hello Modal</h2>
                <p>New Listing: 555 York St Sydney{content}</p>
                <button className="close-modal" onClick={toggleModal}>
                Close
                </button>
            </div>
            </div>
        )}
    </>
  );
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggleModal: PropTypes.func.isRequired,
  content: PropTypes.string.isRequired,
};

export default Modal;