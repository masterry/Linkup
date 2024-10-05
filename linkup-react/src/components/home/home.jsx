import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const { userID } = useParams();
  const [matches, setMatches] = useState([]); // State to hold all matches
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0); // Index of the current match
  const [error, setError] = useState(null); // State to hold any errors

  // Example current location coordinates (for testing)
  const currentLocation = { lat: 34.052235, lon: -118.243683 }; // Replace with actual current location

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/api/matches/${userID}`);
        console.log("API Response:", response.data); // Log the response data
        setMatches(response.data); // Set all matches
      } catch (error) {
        console.error("Error fetching matches:", error);
        setError(error.message); // Store error message in state
      }
    };

    if (userID) {
      fetchMatches();
    }
  }, [userID]);

  const handleSwipeRight = () => {
    console.log("Swiped Right on:", matches[currentMatchIndex].name);
    // Move to the next match
    if (currentMatchIndex < matches.length - 1) {
      setCurrentMatchIndex(currentMatchIndex + 1);
    } else {
      console.log("No more matches available.");
    }
  };

  const handleSwipeLeft = () => {
    console.log("Swiped Left on:", matches[currentMatchIndex].name);
    // Move to the next match
    if (currentMatchIndex < matches.length - 1) {
      setCurrentMatchIndex(currentMatchIndex + 1);
    } else {
      console.log("No more matches available.");
    }
  };

  const getFormattedDistance = () => {
    if (matches[currentMatchIndex]) {
      const match = matches[currentMatchIndex];
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
        {matches.length === 0 && !error && <p>Loading matches...</p>} {/* Loading state */}
        {matches.length > 0 && (
          <div className="card">
            {matches[currentMatchIndex].profilePicture ? (
              <img src={matches[currentMatchIndex].profilePicture} alt="Profile" />
            ) : (
              <p>No profile picture available</p>
            )}
            <h2>{matches[currentMatchIndex].name}</h2>
            <p>{matches[currentMatchIndex].age} years old</p>
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
