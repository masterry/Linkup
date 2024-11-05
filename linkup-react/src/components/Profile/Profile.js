import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './Profile.css'; // Create a CSS file for styles if needed

const Profile = () => {
    const { userID } = useParams(); // Get userID from the URL
    const [userData, setUserData] = useState(null); // State to store user data
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state

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

    // Loading state
    if (loading) {
        return <div>Loading...</div>;
    }

    // Error state
    if (error) {
        return <div>{error}</div>;
    }

    // User data rendering
    return (
        <div className="profile-container">
            <h2>{userData.name}'s Profile</h2>
            <img src={userData.profilePicture} alt={`${userData.name}'s profile`} className="profile-picture" />
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
