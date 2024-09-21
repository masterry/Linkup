import React, { useState } from 'react';
import axios from 'axios';
import './createProfile.css';

const CreateProfile = () => {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [location, setLocation] = useState('');
    const [bio, setBio] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await axios.post('http://127.0.0.1:5000/create-profile', {
                name,
                age,
                gender,
                location,
                bio,
                profilePicture,
            });
            setMessage(response.data.message);
        } catch (error) {
            if (error.response) {
                setMessage(error.response.data.message);
            } else {
                setMessage('An unexpected error occurred.');
            }
        }
    };

    return (
        <div className="signup-container">
            <h2>Create Profile</h2>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label>Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <label>Age:</label>
                    <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <label>Gender:</label>
                    <select value={gender} onChange={(e) => setGender(e.target.value)} required>
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div className="input-group">
                    <label>Location:</label>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <label>Bio:</label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        style={{ width: '80%', padding: '10px', border: '1px solid #ff6f91', borderRadius: '5px', fontSize: '16px' }} // Apply inline styles for textarea
                    />
                </div>
                <div className="input-group">
                    <label>Profile Picture URL:</label>
                    <input
                        type="text"
                        value={profilePicture}
                        onChange={(e) => setProfilePicture(e.target.value)}
                    />
                </div>
                <button type="submit" className="signup-button">Create Profile</button>
            </form>
            {message && <p className="message">{message}</p>}
        </div>
    );
};

export default CreateProfile;
