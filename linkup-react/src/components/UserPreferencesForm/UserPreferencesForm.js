import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './UserPreferencesForm.css';
import Logo from '../Logo/Logo'; // Import Logo component

const UserPreferencesForm = () => {
  const { userID } = useParams();
  const navigate = useNavigate();
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
      const response = await axios.put(`https://linkup-dating-2e181815b60e.herokuapp.com/api/user/preferences/${userID}`, preferencesData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Preferences updated successfully:', response.data);
      navigate(`/home/${userID}`); // Navigate to /home with userID
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  return (
    <div className="preferences-page">
      {/* Logo outside the form container */}
      <header className="preferences-header">
        <Logo /> {/* Logo positioned on top-left */}
      </header>

      <div className="containerr">
        <h2>User Preferences</h2>
        <form onSubmit={handleSubmit} className="form">
          <div className="input-container">
            <label className="label">
              Minimum Age:
              <input
                type="number"
                value={minAge}
                onChange={(e) => setMinAge(e.target.value)}
                required
                className="input"
              />
            </label>
          </div>
          <div className="input-container">
            <label className="label">
              Maximum Age:
              <input
                type="number"
                value={maxAge}
                onChange={(e) => setMaxAge(e.target.value)}
                required
                className="input"
              />
            </label>
          </div>
          <div className="input-container">
            <label className="label">
              Gender Preference:
              <select
                value={genderPreference}
                onChange={(e) => setGenderPreference(e.target.value)}
                required
                className="input"
              >
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </label>
          </div>
          <div className="input-container">
            <label className="label">
              Distance Preference (in km):
              <input
                type="number"
                value={distancePreference}
                onChange={(e) => setDistancePreference(e.target.value)}
                required
                className="input distance-input" 
              />
            </label>
          </div>
          <button type="submit" className="button">Submit Preferences</button>
        </form>
      </div>
    </div>
  );
};

export default UserPreferencesForm;
