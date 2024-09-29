import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom'; // Import useParams
import countryList from 'country-list'; // Import the country list
import './createProfile.css';

const CreateProfile = () => {
    const { userID } = useParams(); // Get userID from the URL
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [country, setCountry] = useState(''); // Change location to country
    const [bio, setBio] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await axios.put(`http://127.0.0.1:5000/api/userprofile/${userID}`, {
                name,
                age,
                gender,
                country, // Change location to country
                bio,
                profilePicture,
            });
            setMessage(response.data.message);
        } catch (error) {
            console.error('Error during create:', error.response ? error.response.data : error.message);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePicture(reader.result); // Store the data URL in the state
            };
            reader.readAsDataURL(file); // Convert the file to a data URL
        }
    };

    // Get the list of countries
    const countries = countryList.getData();

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
                    <label>Country:</label>
                    <select value={country} onChange={(e) => setCountry(e.target.value)} required>
                        <option value="">Select a country</option>
                        {countries.map((country) => (
                            <option key={country.code} value={country.name}>
                                {country.name}
                            </option>
                        ))}
                    </select>
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
                    <label>Profile Picture:</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                </div>
                {profilePicture && <img src={profilePicture} alt="Profile Preview" style={{ width: '100px', height: '100px', borderRadius: '50%' }} />} {/* Display preview of the uploaded image */}
                <button type="submit" className="signup-button">Create Profile</button>
            </form>
            {message && <p className="message">{message}</p>}
        </div>
    );
};

export default CreateProfile;
