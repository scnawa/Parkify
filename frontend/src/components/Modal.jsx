import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './Modal.css';
import NotificationComponent from './Notifications';

const Modal = ({ isOpen, setnotiLocation }) => {
  const [notifications, setNotifications] = useState([]);
  const [token, setToken] = React.useState(localStorage.getItem('token'));

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/getNotifs', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'token': token,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }
        const data = await response.json();
        setNotifications(data);
        console.log("Success")
        console.log(data)
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const closeModal = () => {
    setnotiLocation(false);
  }

  return (
    <>
      {isOpen && (
        <div className="modal">
          <div className="modal-content">
            {notifications.length === 0 ? (
              <p>No notifications</p>
            ) : (
              notifications.map(notification => (
                <NotificationComponent
                  key={notification.id}
                  title={notification.title.substring(0, 15)}
                  description={notification.description}
                  date={notification.date}
                  onReadClick={closeModal}
                />
              ))
            )}
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
  setnotiLocation: PropTypes.func.isRequired,
};

export default Modal;