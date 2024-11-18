import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import './HomePage.css';

const HomePage = () => {
  const { userID } = useParams();
  const navigate = useNavigate(); // Initialize useNavigate
  const [matches, setMatches] = useState([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [error, setError] = useState(null);
  const [noMoreMatches, setNoMoreMatches] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState('');
  const [matchPopup, setMatchPopup] = useState(false);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/api/matches/${userID}`);
        console.log("API Response:", response.data);
        setMatches(response.data);
      } catch (error) {
        console.error("Error fetching matches:", error);
        setError(error.message);
      }
    };

    if (userID) {
      fetchMatches();
    }
  }, [userID]);

  const handleSwipe = async (direction) => {
    if (matches.length === 0) return;

    const targetUser = matches[currentMatchIndex].userID;

    const payload = {
      user: userID,
      targetUser: targetUser,
      direction: direction,
    };

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/swipes', payload);
      console.log(`Swiped ${direction} on:`, matches[currentMatchIndex].name);

      if (response.data.matchID) {
        setMatchPopup(true); // Show the popup if there is a match
      }

      setSwipeDirection(direction === 'like' ? 'swipe-right' : 'swipe-left');

      setTimeout(() => {
        setCurrentMatchIndex((prevIndex) => {
          if (prevIndex < matches.length - 1) {
            return prevIndex + 1;
          } else {
            setNoMoreMatches(true);
            return prevIndex;
          }
        });
        setSwipeDirection('');
      }, 300);
    } catch (error) {
      console.error(`Error swiping ${direction}:`, error);
      setError(error.message);
    }
  };

  const handleSwipeRight = () => handleSwipe('like');
  const handleSwipeLeft = () => handleSwipe('dislike');

  const getFormattedDistance = () => {
    if (matches[currentMatchIndex]) {
      const match = matches[currentMatchIndex];
      const [latStr, lonStr] = match.location.split(',');
      const lat = parseFloat(latStr);
      const lon = parseFloat(lonStr);

      if (!isNaN(lat) && !isNaN(lon)) {
        const distance = match.distance;
        return `${Math.round(distance * 1000) / 1000} km away`;
      }
    }
    return "Distance unknown";
  };

  const startChat = () => {
    const targetUser = matches[currentMatchIndex].userID; // Get the target user's ID
    const targetUserName = matches[currentMatchIndex].name; // Get the target user's name
    
    // Pass the `recipient_name` as state, and `sender` and `recipient` as query parameters
    navigate(`/initiatechat?sender=${userID}&recipient=${targetUser}`, {
      state: { recipient_name: targetUserName, recipient: targetUser }
    });
    setMatchPopup(false);
  };
  

  const keepSwiping = () => {
    setMatchPopup(false);
  };

  return (
    <div className="home-page">
      <header className="header">
        <h1>Linkup</h1>
        <button className="login-button">Edit Profile</button>
      </header>
      
      <main className="profile-cards">
        {error && <p className="error-message">Error: {error}</p>} 
        {noMoreMatches && <p>No more potential matches around you.</p>} 
        {matches.length === 0 && !error && !noMoreMatches && <p>Loading matches...</p>} 
        {matches.length > 0 && !noMoreMatches && (
          <div className={`card ${swipeDirection}`}>
            {matches[currentMatchIndex].profilePicture ? (
              <img src={matches[currentMatchIndex].profilePicture} alt="Profile" />
            ) : (
              <p>No profile picture available</p>
            )}
            <h2>{matches[currentMatchIndex].name}</h2>
            <p>{matches[currentMatchIndex].age} years old</p>
            <p>{getFormattedDistance()}</p> 
            <div className="swipe-buttons">
              <button className="swipe-button left" onClick={handleSwipeLeft}>Swipe Left</button>
              <button className="swipe-button right" onClick={handleSwipeRight}>Swipe Right</button>
            </div>
          </div>
        )}
      </main>

      {matchPopup && (
        <div className="popup">
          <h2>WOW! It's a match!</h2>
          <button onClick={startChat}>Start Chat</button>
          <button onClick={keepSwiping}>Keep Swiping</button>
        </div>
      )}
      
      <footer className="footer">
        <p>&copy; 2024 Linkup</p>
      </footer>
    </div>
  );
};

export default HomePage;