import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import './UserPreferencesForm.css';

const UserPreferencesForm = () => {
  const { userID } = useParams();
  const navigate = useNavigate(); // Initialize useNavigate
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [genderPreference, setGenderPreference] = useState('');
  const [distancePreference, setDistancePreference] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    const preferencesData = {
      minAge,
      maxAge,
      genderPreference,
      distancePreference,
    };

    try {
      const response = await axios.put(`http://127.0.0.1:5000/api/user/preferences/${userID}`, preferencesData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Preferences updated successfully:', response.data);
      
      // Navigate to the Home page after successful submission
      navigate(`/home/${userID}`); // Navigate to /home with userID
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  return (
    <div className="signup-container">
      <h2>User Preferences</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>
            Minimum Age:
            <input
              type="number"
              value={minAge}
              onChange={(e) => setMinAge(e.target.value)}
              required
            />
          </label>
        </div>
        <div className="input-group">
          <label>
            Maximum Age:
            <input
              type="number"
              value={maxAge}
              onChange={(e) => setMaxAge(e.target.value)}
              required
            />
          </label>
        </div>
        <div className="input-group">
          <label>
            Gender Preference:
            <select
              value={genderPreference}
              onChange={(e) => setGenderPreference(e.target.value)}
              required
            >
              <option value="">Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </label>
        </div>
        <div className="input-group distance-container"> 
          <label>
            Distance Preference (in km):
          </label>
          <input
            type="number"
            value={distancePreference}
            onChange={(e) => setDistancePreference(e.target.value)}
            required
            className="distance-input" 
          />
        </div>
        <button type="submit" className="signup-button">Submit Preferences</button>
      </form>
    </div>
  );
};

export default UserPreferencesForm;
