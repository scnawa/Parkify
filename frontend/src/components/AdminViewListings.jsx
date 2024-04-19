import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import MyListings from './MyListings';
import ProfilePage from './ProfilePage';
// The page for admin to perform operation on user listings and user profile
function AdminViewListings(props) {
	const [selectedUser, setSelectedUser] = useState(null);
	const [users, setUsers] = useState([]);
	const location = useLocation();
	// eslint-disable-next-line
	const { token, email } = location.state || {};
	// dont remove token above due to usestate 

	// fetch the list of users to view their listings
	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch('http://localhost:8080/get_all_users', {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
				});
				const data = await response.json();
				setUsers(data.map(user => ({ ...user, label: `${user.username} (${user.email})` })));

				if (email) {
					const userWithEmail = data.find(user => user.email === email);
					if (userWithEmail) {
						setSelectedUser({ ...userWithEmail, label: `${userWithEmail.username} (${userWithEmail.email})` });
					}
				}
			} catch (error) {
				console.error('An error occurred during data fetching:', error);
			}
		};
		fetchData();
	}, [email]);

	const handleUserChange = (_, newValue) => {
		setSelectedUser(newValue);
	};
	// render the selection search bar and the selected user info
	return (
		<div>
			<Autocomplete
				id="user-select-combo"
				options={users}
				sx={{ width: 300, marginLeft: 2, marginTop: 2 }}
				value={selectedUser}
				onChange={handleUserChange}
				autoHighlight
				getOptionLabel={(option) => option.label}
				renderInput={(params) => <TextField {...params} label="Select User" variant="outlined" />}
			/>
			{selectedUser && (
				<ProfilePage key={`profile-${selectedUser.email}`} token={props.token} email={selectedUser.email} isAdmin={props.isAdmin} username={selectedUser.username} />
			)}
			{selectedUser && (
				<MyListings key={`listings-${selectedUser.email}`} token={props.token} email={selectedUser.email} isAdmin={props.isAdmin} username={selectedUser.username} />
			)}
		</div>
	);
}

export default AdminViewListings;
