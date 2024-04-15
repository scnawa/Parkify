import React from 'react';
import PropTypes from 'prop-types';

const NotificationComponent = ({ title, description, date, onReadClick }) => {
  return (
    <div className="notification-component">
      <div className="notification-content">
        <h3>{title}</h3>
        <p>{description}</p>
        <p>{date}</p>
      </div>
      <button className="read-button" onClick={onReadClick}>
        Read
      </button>
    </div>
  );
};

NotificationComponent.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  onReadClick: PropTypes.func.isRequired,
};

export default NotificationComponent;