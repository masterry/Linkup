import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes, useParams, useLocation } from 'react-router-dom';
import SignUp from "./components/signup/signup";
import SignIn from './components/signin/signin';
import HomePage from './components/home/home';
import CreateProfile from './components/createprofile/createProfile';
import UserPreferencesForm from './components/UserPreferencesForm/UserPreferencesForm';
import Messages from './components/messages/messages';
import Navbar from './components/Navbar/Navbar'; // Import the Navbar
import Profile from './components/Profile/Profile'; // Import Profile component
import { useEffect, useState } from 'react';

// MainApp component handles routing and navbar visibility
function MainApp() {
  const [userID, setUserID] = useState(null);
  const location = useLocation(); // Get current location

  useEffect(() => {
    // Logic to get userID here
  }, []);

  return (
    <>
      {location.pathname !== '/' && location.pathname !== '/signup' && (
        <Navbar userID={userID} />
      )}
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home/:userID" element={<HomeWrapper setUserID={setUserID} />} />
        <Route path="/createprofile/:userID" element={<CreateProfile />} />
        <Route path="/userpreferences/:userID" element={<UserPreferencesForm />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/profile/:userID" element={<Profile />} /> {/* Route for Profile */}
      </Routes>
    </>
  );
}

// HomeWrapper component to handle userID retrieval and pass it to HomePage
function HomeWrapper({ setUserID }) {
  const { userID } = useParams(); // Get userID from the URL params

  useEffect(() => {
    setUserID(userID); // Set the userID in App state
  }, [userID, setUserID]);

  return <HomePage />; // Render HomePage
}

// App component wraps everything in a Router
function App() {
  return (
    <Router>
      <MainApp /> {/* MainApp handles routing and navbar */}
    </Router>
  );
}

export default App;
