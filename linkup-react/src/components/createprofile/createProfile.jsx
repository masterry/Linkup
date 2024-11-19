import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom'; 
import './createProfile.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'; 
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const CreateProfile = () => {
    const { userID } = useParams();
    const navigate = useNavigate(); 
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [location, setLocation] = useState(null); // Start with null, no default location
    const [bio, setBio] = useState('');
    const [profilePicture, setProfilePicture] = useState(null); // Set this as file, not string
    const [message, setMessage] = useState('');

    // Initialize Leaflet icon
    useEffect(() => {
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
            iconUrl: require('leaflet/dist/images/marker-icon.png'),
            shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
        });
    }, []);

    // Function to get user location
    const getLocation = () => {
        console.log("Attempting to get location..."); // Debug log
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    console.log(`Location retrieved: ${latitude}, ${longitude}`); // Debug log
                    setLocation([latitude, longitude]);
                },
                (error) => {
                    console.error("Error obtaining location:", error);
                    alert("Unable to retrieve your location. Please ensure location services are enabled and try again.");
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    useEffect(() => {
        getLocation(); // Call the function to get location
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!location) {
            alert("Please allow location access to create your profile.");
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('age', age);
        formData.append('gender', gender);
        formData.append('location', JSON.stringify(location)); // Ensure location is a stringified array
        formData.append('bio', bio);

        if (profilePicture) {
            formData.append('profilePicture', profilePicture);
        }

        // Log the data being sent to see if it’s correct
        console.log('FormData:', formData);

        try {
            const response = await axios.put(`http://127.0.0.1:5000/api/usersprofile/${userID}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setMessage(response.data.message);
            navigate(`/userpreferences/${userID}`);
        } catch (error) {
            console.error('Error during create:', error.response ? error.response.data : error.message);
        }
    };
    

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePicture(file);  // Store file itself
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
                    {location ? (
                        <MapContainer center={location} zoom={13} style={{ height: '300px', width: '100%' }}>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <Marker position={location}>
                                <Popup>
                                    You are here!
                                </Popup>
                            </Marker>
                        </MapContainer>
                    ) : (
                        <p>Getting your location...</p>
                    )}
                </div>
                <div className="input-group">
                    <label>Bio:</label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        style={{ width: '80%', padding: '10px', border: '1px solid #ff6f91', borderRadius: '5px', fontSize: '16px' }}
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
                {profilePicture && <img src={URL.createObjectURL(profilePicture)} alt="Profile Preview" style={{ width: '100px', height: '100px', borderRadius: '50%' }} />}
                <button type="submit" className="signup-button">Create Profile</button>
            </form>
            {message && <p className="message">{message}</p>}
        </div>
    );
};

export default CreateProfile;
