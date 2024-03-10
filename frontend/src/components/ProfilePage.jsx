import React, { useState, useEffect } from 'react'
import './ProfilePage.css'
import defaultProfilePicture from '../.././src/assets/user.png'

const ProfilePage = () => {

    const [profilePicture, setProfilePicture] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        });
    
    useEffect(() => {
        // async/await
        const userData = {
            name: 'Dru',
            email: 'Dru@hotmail.com',
        };

        // Update the state with user data
        setFormData(userData);
    }, []);

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
            const response = await fetch('/deleteAccount', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    // Add any additional headers as needed
                },
                body: JSON.stringify({
                    email: formData.email,
                }),
            });
    
            if (response.ok) {
                console.log('Profile deleted successfully!');
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
                <div className='form-container'>
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
                        <div class="card-number">
                            <label> BSB: </label>
                            <input type="text" class="card-number-field"
                                placeholder="000-000" />
                        </div>
                        <div class="date-number">
                            <label> ACC #: </label>
                            <input type="text" class="date-number-field"
                                placeholder="0123456789" />
                        </div>
                        <button type="submit" className="submit-profile-button">Save Changes</button>
                    </form>
                    <button onClick={handleDeleteProfile} className="delete-profile-button">
                        Delete Profile
                    </button>
                </div>
            </div>
        </div>
        )
    }

export default ProfilePage;