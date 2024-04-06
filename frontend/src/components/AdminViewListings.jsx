import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import MyListings from './MyListings'; 

function AdminViewListings(props) {
  const [selectedName, setSelectedName] = useState('');
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
        setUsers(data);

  
        if(token) {
          const userWithEmail = data.find(user => user.email === token);
          if(userWithEmail) {
            setSelectedUser(userWithEmail);
            setSelectedName(userWithEmail.username); 
          }
        }
      } catch (error) {
        console.error('An error occurred during data fetching:', error);
      }
    };
    fetchData();
  }, [token]); 

  const handleNameChange = (event) => {
    const { value } = event.target; 
    const user = users.find(user => user.username === value);
    setSelectedUser(user); 
    setSelectedName(value); 
  };

  return (
    <div>
      <FormControl variant="outlined" sx={{ minWidth: 240, marginLeft: 2, marginTop: 2 }}>
        <InputLabel id="name-select-label">Select User</InputLabel>
        <Select
          labelId="name-select-label"
          id="name-select"
          value={selectedName}
          onChange={handleNameChange}
          label="Select User"
        >
          {users.map((user) => (
            <MenuItem key={user.username} value={user.username}>{user.username}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedUser && (
        <MyListings key={selectedUser.email} token={selectedUser.email} isAdmin={props.isAdmin} username={selectedUser.username} />
      )}
    </div>
  );
}

export default AdminViewListings;
