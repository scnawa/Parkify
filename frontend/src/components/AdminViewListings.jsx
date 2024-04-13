import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import MyListings from './MyListings';
import ProfilePage from './ProfilePage';

function AdminViewListings(props) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const location = useLocation();
  const { token } = location.state || {};

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

        if (token) {
          const userWithEmail = data.find(user => user.session_id.any((id) => (id === token)));
          if (userWithEmail) {
            setSelectedUser({ ...userWithEmail, label: `${userWithEmail.username} (${userWithEmail.email})` });
          }
        }
      } catch (error) {
        console.error('An error occurred during data fetching:', error);
      }
    };
    fetchData();
  }, [token]);

  const handleUserChange = (_, newValue) => {
    setSelectedUser(newValue);
  };

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
        <ProfilePage token={props.token} email={selectedUser.email} isAdmin={props.isAdmin} username={selectedUser.username} />
      )}
      {selectedUser && (
        <MyListings key={selectedUser.email} token={props.token} email={selectedUser.email} isAdmin={props.isAdmin} username={selectedUser.username} />
      )}
    </div>
  );
}

export default AdminViewListings;
