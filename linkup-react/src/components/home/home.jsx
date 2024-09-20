import React from 'react';
import './HomePage.css'; // Create a CSS file for styling

const HomePage = () => {
  return (
    <div className="home-page">
      <header className="header">
        <h1>Linkup</h1>
        <button className="login-button">Edit Profile</button>
      </header>
      
      <main className="profile-cards">
        <div className="card">
          <img src="https://via.placeholder.com/300" alt="Profile" />
          <h2>John Doe</h2>
          <p>25, New York</p>
          <button className="swipe-button">Swipe Right</button>
        </div>
        <div className="card">
          <img src="https://via.placeholder.com/300" alt="Profile" />
          <h2>Jane Smith</h2>
          <p>28, Los Angeles</p>
          <button className="swipe-button">Swipe Right</button>
        </div>
        {/* Add more profile cards as needed */}
      </main>
      
      <footer className="footer">
        <p>&copy; 2024 Linkup</p>
      </footer>
    </div>
  );
};

export default HomePage;
