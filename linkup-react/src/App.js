import './App.css';
import { BrowserRouter as Router, Route, Routes, useParams, useLocation } from 'react-router-dom';
import SignUp from "./components/signup/signup";
import SignIn from './components/signin/signin';
import HomePage from './components/home/home';
import CreateProfile from './components/createprofile/createProfile';
import UserPreferencesForm from './components/UserPreferencesForm/UserPreferencesForm';
import Messages from './components/messages/messages';
import Navbar from './components/Navbar/Navbar';
import Profile from './components/Profile/Profile';
import ChatHistory from './components/chathistory/chatHistory';
import InitiateChat from './components/InitiateChat/initiateChat';
import { useEffect, useState } from 'react';
import axios from 'axios';

function MainApp() {
  const [userID, setUserID] = useState(null);
  const currentLocation = useLocation(); // Track changes in route

  useEffect(() => {
    if (userID) {
      // Function to update location
      const updateLocation = (lat, long) => {
        const locationData = `[${lat}, ${long}]`; // Format location as string

        // Send location to the backend API
        axios.post(`http://127.0.0.1:5000/update_location/${userID}`, { location: locationData })
          .then(response => {
            console.log('Location updated successfully:', response.data);
          })
          .catch(error => {
            console.error('Error updating location:', error);
          });
      };

      // Success callback for geolocation
      const success = (position) => {
        const { latitude, longitude } = position.coords;
        updateLocation(latitude, longitude); // Update location on backend
      };

      // Error callback for geolocation
      const error = (err) => {
        console.error('Error getting geolocation:', err.message);
      };

      // Start watching the user's location
      if (navigator.geolocation) {
        const geoWatchId = navigator.geolocation.watchPosition(success, error, { enableHighAccuracy: true, timeout: 10000 });

        // Cleanup geolocation watch on component unmount
        return () => {
          navigator.geolocation.clearWatch(geoWatchId);
        };
      } else {
        console.error('Geolocation is not supported by this browser.');
      }
    }
  }, [userID, currentLocation]); // Runs when userID or route changes

  return (
    <>
      {currentLocation.pathname !== '/' && currentLocation.pathname !== '/signup' && (
        <Navbar userID={userID} />
      )}
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home/:userID" element={<HomeWrapper setUserID={setUserID} />} />
        <Route path="/createprofile/:userID" element={<CreateProfile userID={userID} />} />
        <Route path="/userpreferences/:userID" element={<UserPreferencesForm userID={userID} />} />
        <Route path="/messages" element={<Messages userID={userID} />} />
        <Route path="/initiatechat" element={<InitiateChat userID={userID} />} />
        <Route path="/chathistory/:userID" element={<ChatHistory userID={userID} />} />
        <Route path="/profile/:userID" element={<Profile userID={userID} />} />
      </Routes>
    </>
  );
}

function HomeWrapper({ setUserID }) {
  const { userID } = useParams(); // Get userID from the URL params

  useEffect(() => {
    setUserID(userID); // Set the userID in App state
  }, [userID, setUserID]);

  return <HomePage userID={userID} />; // Render HomePage
}

function App() {
  return (
    <Router>
      <MainApp /> {/* MainApp handles routing and navbar */}
    </Router>
  );
}

export default App;
