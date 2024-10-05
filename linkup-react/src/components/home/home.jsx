import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const { userID } = useParams();
  const [match, setMatch] = useState(null); // State to hold a single match
  const [error, setError] = useState(null); // State to hold any errors

  // Example current location coordinates (for testing)
  const currentLocation = { lat: 34.052235, lon: -118.243683 }; // Replace with actual current location

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/api/matches/${userID}`);
        console.log("API Response:", response.data); // Log the response data
        if (response.data.length > 0) {
          setMatch(response.data[0]); // Set the first match
        }
      } catch (error) {
        console.error("Error fetching match:", error);
        setError(error.message); // Store error message in state
      }
    };

    if (userID) {
      fetchMatch();
    }
  }, [userID]);

  const handleSwipeRight = () => {
    console.log("Swiped Right on:", match.name);
  };

  const handleSwipeLeft = () => {
    console.log("Swiped Left on:", match.name);
  };

  const getFormattedDistance = () => {
    if (match) {
      // Extract latitude and longitude from the location string
      const [latStr, lonStr] = match.location.split(',');
      const lat = parseFloat(latStr);
      const lon = parseFloat(lonStr);

      // Check if latitude and longitude are valid numbers
      if (!isNaN(lat) && !isNaN(lon)) {
        // Use the distance provided by the API response
        const distance = match.distance; // Distance is in kilometers already
        return `${Math.round(distance * 1000) / 1000} km away`; // Format to 3 decimal places
      }
    }
    return "Distance unknown"; // Fallback message
  };

  return (
    <div className="home-page">
      <header className="header">
        <h1>Linkup</h1>
        <button className="login-button">Edit Profile</button>
      </header>
      
      <main className="profile-cards">
        {error && <p className="error-message">Error: {error}</p>} {/* Display error message */}
        {!match && !error && <p>Loading match...</p>} {/* Loading state */}
        {match && (
          <div className="card">
            {match.profilePicture ? (
              <img src={match.profilePicture} alt="Profile" />
            ) : (
              <p>No profile picture available</p>
            )}
            <h2>{match.name}</h2>
            <p>{match.age} years old</p>
            <p>{getFormattedDistance()}</p> {/* Display formatted distance */}
            <div className="swipe-buttons">
              <button className="swipe-button left" onClick={handleSwipeLeft}>Swipe Left</button>
              <button className="swipe-button right" onClick={handleSwipeRight}>Swipe Right</button>
            </div>
          </div>
        )}
      </main>
      
      <footer className="footer">
        <p>&copy; 2024 Linkup</p>
      </footer>
    </div>
  );
};

export default HomePage;
