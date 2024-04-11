import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Typography, TextField, Button, Avatar, Stack } from '@mui/material';
import Logout from './logout';
import GetUser from './GetUser';
import defaultProfilePicture from '../../src/assets/user.png';

const ProfilePage = (props) => {
    const [formData, setFormData] = useState({
        name: "",
        email: props.token,
    });
    const navigate = useNavigate();
    const [profilePicture, setProfilePicture] = useState(defaultProfilePicture);

    useEffect(() => {
        const fetchData = async () => {
          try {
            const userData = await GetUser(props.token);
            console.log(userData);
            setFormData({
                ...formData,
                name: userData.username,  
              });
          } catch (error) {
            console.error('Error fetching user:', error);
          }
        };
    
        fetchData();
    }, [props.token]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        // add fetch request to change backend data here
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePicture(URL.createObjectURL(file));
        }
    };

    const handleDeleteProfile = async () => {
        if (window.confirm("Are you sure you want to delete this account?")) {
            try {
                if (!props.isAdmin) {
                    await Logout(props.token, props.SID, props.setToken, props.setSID, props.setIsAdmin);
                }
                const response = await fetch('/deleteAccount', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: props.token,
                    }),
                });
        
                if (response.ok) {
                    console.log('Profile deleted successfully!');
                    if (!props.isAdmin) {
                        navigate(0)
                    }
                    else {
                        navigate('/')
                    }
                    
                } else {
                    console.error('Failed to delete profile. Server response:', response.status, response.statusText);
                }
            } catch (error) {
                console.error('An error occurred during the deletion:', error);
            }
        }
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Stack spacing={4} alignItems="center">
            <Typography variant="h4" component="div">
					{props.isAdmin ? `${props.username}'s Profile` : 'My Profile'}
				</Typography>
                <Avatar
                    src={profilePicture}
                    alt="Profile"
                    sx={{ width: 150, height: 150, mb: 2 }}
                />
                <Button
                    variant="contained"
                    component="label"
                    color="success"
                    sx={{ bgcolor: 'green' }}
                >
                    Change Image
                    <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleImageChange}
                    />
                </Button>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="name"
                        label="Name"
                        name="name"
                        autoComplete="name"
                        autoFocus
                        value={formData.name}
                        onChange={handleInputChange}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email"
                        name="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleInputChange}
                    />

                    <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="success"
                            sx={{ flexGrow: 1 }}
                        >
                            Save Changes
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleDeleteProfile}
                            sx={{ flexGrow: 1 }}
                        >
                            Delete Profile
                        </Button>
                    </Stack>
                </Box>
            </Stack>
        </Box>
    );
}

export default ProfilePage;
