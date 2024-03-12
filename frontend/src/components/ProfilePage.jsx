import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import Logout from './logout';
import GetUser from './GetUser';
import './ProfilePage.css'
import defaultProfilePicture from '../.././src/assets/user.png'


const ProfilePage = (props) => {
    //console.log(props);
    const [user, setUser] = useState(null);
    useEffect(() => {
        const fetchData = async () => {
          try {
            const userData = await GetUser(props.token);
            setUser(userData);
          } catch (error) {
            console.error('Error fetching user:', error);
          }
        };
    
        fetchData();
      }, [props.token]);
      console.log(user);
    const navigate = useNavigate();
    const [profilePicture, setProfilePicture] = useState(null);
    const [formData, setFormData] = useState({
        name: "user",
        email: props.token,
        });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        // Create FormData object to send mixed content (text + files)
        // Append profile picture if selected
        // await async
        console.log('Form submitted:', formData);
        };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setProfilePicture(file);
    };

    const handleDeleteProfile = async () => {
        try {
            await Logout(props.token, props.SID, props.setToken);
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

                navigate('/')
            } else {
                console.error('Failed to delete profile. Server response:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('An error occurred during the deletion:', error);
        }
    };

    return (
        <div className='container'>
            <div className="left-box">
                <h3>Profile Image</h3>
                <div className='profile-picture'>
                    {profilePicture ? (
                        <img src={URL.createObjectURL(profilePicture)} alt="Profile" />
                    ) : (
                        <img src={defaultProfilePicture} alt="Profile"/>
                    )}
                </div>
                <button
                        className="upload-button"
                        onClick={() => document.getElementById('profileImageInput').click()}
                    >
                        Change Image
                    </button>
                    <input
                        type="file"
                        accept="image/*"
                        id="profileImageInput"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                    />  
            </div>
            <div className='right-box'>
                    <form onSubmit={handleSubmit}>
                        <label>
                        Name:
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                        />
                        </label>
                        <label>
                        Email:
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                        />
                        </label>
                        <h3>Add Payment</h3>
                        <div class="B-number">
                            <label> BSB:
                                <input 
                                    type="text" 
                                    class="A-number-field"
                                    placeholder="000-000" />
                                </label>
                            
                        </div>
                        <div class="A-number">
                            <label> ACC#: 
                                <input 
                                    type="text" 
                                    class="B-number-field"
                                    placeholder="0123456789" />
                                </label>
                        </div>
                        <button type="submit" className="submit-profile-button">
                            Save Changes
                        </button>
                    </form> 
                    <button onClick={handleDeleteProfile} className="delete-profile-button">
                        Delete Profile
                    </button>
                </div>
        </div>
        )
    }

export default ProfilePage;