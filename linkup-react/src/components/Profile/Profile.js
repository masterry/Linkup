import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './Profile.css'; // Assuming the styles are in Profile.css
import Logo from '../Logo/Logo'; // Import Logo component

const Profile = () => {
    const { userID } = useParams();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newProfilePicture, setNewProfilePicture] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`https://linkup-dating-2e181815b60e.herokuapp.com/api/users/${userID}`);
                setUserData(response.data);
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError('Failed to fetch user data.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userID]);

    const handleFileChange = (event) => {
        setNewProfilePicture(event.target.files[0]);
    };

    const handleProfilePictureUpload = async () => {
        const formData = new FormData();
        formData.append('file', newProfilePicture);

        try {
            const response = await axios.put(`https://linkup-dating-2e181815b60e.herokuapp.com/api/userprofile/${userID}/profile-picture`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setUserData((prevData) => ({
                ...prevData,
                profilePicture: response.data.file_path
            }));

            setNewProfilePicture(null);
        } catch (err) {
            console.error('Error updating profile picture:', err);
            setError('Failed to update profile picture.');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    const profileImageUrl = `https://linkup-dating-2e181815b60e.herokuapp.com/${userData.profilePicture}`;

    return (
        <div className="profile-page">
            {/* Logo positioned outside and at the top-left */}
            <header className="profile-header">
                <Logo />  {/* Place the Logo outside profile container */}
            </header>

            <div className="profile-container">
                <h2>{userData.name}'s Profile</h2>
                <div className="profile-picture-container">
                    <img src={profileImageUrl} alt={`${userData.name}'s profile`} className="profile-picture" />
                    <button 
                        className="edit-button" 
                        onClick={() => document.getElementById('file-input').click()}
                        disabled={newProfilePicture !== null}
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
        </div>
    );
};

export default Profile;
