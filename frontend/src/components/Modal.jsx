import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './Modal.css';
// import NotificationComponent from './NotificationComponent';
import NotificationsIcon from '@mui/icons-material/Notifications';

const Modal = ({ isOpen, setnotiLocation, content }) => {

  // useEffect(() => {
  //   setModal(isOpen);
  // }, [isOpen]);
  const openModal = () => {
    setnotiLocation(true);
  }
  const closeModal = () => {
    setnotiLocation(false);
  }

  // useEffect(() => {
  //   if (isOpen) {
  //     document.body.classList.add('active-modal');
  //   } else {
  //     document.body.classList.remove('active-modal');
  //   }
  //   return () => {
  //     document.body.classList.remove('active-modal');
  //   };
  // }, [isOpen]);

  return (
    <>
        {/* <NotificationsIcon onClick={openModal} className="btn-modal" /> */}
        {isOpen && (
            <div className="modal">
            <div onClick={openModal} className="overlay"></div>
            <div className="modal-content">
                <h2>Hello Modal</h2>
                <p>New Listing: 555 York St Sydney{content}</p>
                <button className="close-modal" onClick={closeModal}>
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
  setnotiLocation: PropTypes.func.isRequired,
  content: PropTypes.string.isRequired,
};

export default Modal;