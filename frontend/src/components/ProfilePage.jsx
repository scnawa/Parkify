import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Avatar, Stack } from '@mui/material';
import GetUser from './GetUser';
import defaultProfilePicture from '../../src/assets/user.png';
import { uploadFile } from './CreateListings';
// The page to show the user profile details and perform related oeprations
const ProfilePage = (props) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
    });
    const navigate = useNavigate();
    const [profilePicture, setProfilePicture] = useState(defaultProfilePicture);

    useEffect(() => {
        if (!props.token) {
            navigate('/');
        }
        const fetchData = async () => {
            try {
                const userData = await GetUser(props.token, props.email);
                setFormData({
                    email: userData.email,
                    name: userData.username,
                });
                setProfilePicture(userData.profilePicture)
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };

        fetchData();
        // eslint-disable-next-line
    }, [props.token]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/updateUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    token: props.token,
                    email: props.email
                },
                body: JSON.stringify({
                    username: formData.name,
                    email: formData.email,
                    profilePicture: profilePicture,
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log('User data updated successfully:', data);
            // Handle success, update UI, etc.
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        uploadFile(file).then((url => { setProfilePicture(url) }));
    };

    const handleDeleteProfile = async () => {
        if (window.confirm("Are you sure you want to delete this account?")) {
            try {

                const response = await fetch('/deleteAccount', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        token: props.token,
                        email: props.email
                    }),
                });
                if (response.ok) {
                    console.log('Profile deleted successfully!');
                    if (!props.isAdmin) {
                        props.setToken(null);
                        props.setEmail(null);
                        localStorage.removeItem('token');
                        localStorage.removeItem('email');
                        navigate('/')
                    }
                    else {
                        navigate(0)
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
