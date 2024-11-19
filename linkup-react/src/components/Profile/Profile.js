import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './Profile.css'; // Create a CSS file for styles if needed

const Profile = () => {
    const { userID } = useParams(); // Get userID from the URL
    const [userData, setUserData] = useState(null); // State to store user data
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state
    const [newProfilePicture, setNewProfilePicture] = useState(null); // State to store the new profile picture file

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:5000/api/users/${userID}`);
                setUserData(response.data); // Set the user data
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError('Failed to fetch user data.');
            } finally {
                setLoading(false); // Set loading to false after fetching data
            }
        };

        fetchUserData();
    }, [userID]);

    // Handle file input change for profile picture
    const handleFileChange = (event) => {
        setNewProfilePicture(event.target.files[0]);
    };

    // Handle profile picture upload
    const handleProfilePictureUpload = async () => {
        const formData = new FormData();
        formData.append('file', newProfilePicture);

        try {
            const response = await axios.put(`http://127.0.0.1:5000/api/userprofile/${userID}/profile-picture`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Update the user data with the new profile picture URL
            setUserData((prevData) => ({
                ...prevData,
                profilePicture: response.data.file_path
            }));

            // Reset the profile picture state and hide upload button
            setNewProfilePicture(null);
        } catch (err) {
            console.error('Error updating profile picture:', err);
            setError('Failed to update profile picture.');
        }
    };

    // Loading state
    if (loading) {
        return <div>Loading...</div>;
    }

    // Error state
    if (error) {
        return <div>{error}</div>;
    }

    // Assuming the profile picture file path is stored in userData.profilePicture
    const profileImageUrl = `http://127.0.0.1:5000/${userData.profilePicture}`;

    return (
        <div className="profile-container">
            <h2>{userData.name}'s Profile</h2>
            <div className="profile-picture-container">
                <img src={profileImageUrl} alt={`${userData.name}'s profile`} className="profile-picture" />
                <button 
                    className="edit-button" 
                    onClick={() => document.getElementById('file-input').click()}
                    disabled={newProfilePicture !== null} // Disable edit button if a file is being uploaded
                >
                    Edit
                </button>
                <input 
                    type="file" 
                    id="file-input" 
                    style={{ display: 'none' }} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                />
            </div>
            {newProfilePicture && (
                <div>
                    <p>Selected file: {newProfilePicture.name}</p>
                    <button onClick={handleProfilePictureUpload}>Upload New Picture</button>
                </div>
            )}
            <p><strong>Email:</strong> {userData.email}</p>
            <p><strong>Age:</strong> {userData.age}</p>
            <p><strong>Gender:</strong> {userData.gender}</p>
            <p><strong>Bio:</strong> {userData.bio || "No bio available."}</p>
            <p><strong>Location:</strong> {userData.location}</p>
            <p><strong>Preferences ID:</strong> {userData.preferencesID}</p>
        </div>
    );
};

export default Profile;
