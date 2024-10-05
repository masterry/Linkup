import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const { userID } = useParams();
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null); // State to hold any errors

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/api/matches/${userID}`);
        console.log("API Response:", response.data); // Log the response data
        setMatches(response.data); // Assuming response.data is an array
      } catch (error) {
        console.error("Error fetching matches:", error);
        setError(error.message); // Store error message in state
      }
    };

    if (userID) {
      fetchMatches();
    }
  }, [userID]);

  const convertBlobToImage = (blob) => {
    return URL.createObjectURL(new Blob([blob]));
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
        {matches.map((match, index) => (
          <div key={index} className="card">
            <img src={convertBlobToImage(match.profilePicture)} alt="Profile" />
            <h2>{match.name}</h2>
            <p>{match.age}, {match.location}</p>
            <button className="swipe-button">Swipe Right</button>
          </div>
        ))}
      </main>
      
      <footer className="footer">
        <p>&copy; 2024 Linkup</p>
      </footer>
    </div>
  );
};

export default HomePage;
