import React from 'react';
import PropTypes from 'prop-types';
// The component of the notification pop up
const NotificationComponent = ({ title, description, date, onReadClick }) => {
	return (
		<div className="notification-component">
			<div className="notification-content">
				<h3>{title}</h3>
				<p>{description}</p>
				<p>{date}</p>
			</div>
		</div>
	);
};

NotificationComponent.propTypes = {
	title: PropTypes.string.isRequired,
	description: PropTypes.string.isRequired,
	onReadClick: PropTypes.func.isRequired,
};

export default NotificationComponent;