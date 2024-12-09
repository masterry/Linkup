import './App.css';
import { BrowserRouter as Router, Route, Routes, useParams, useLocation } from 'react-router-dom';
import LandingPage from './components/LandingPage/landingPage';
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
import ChatApp from './components/ChatApp/ChatApp';
import { useEffect, useState } from 'react';
import useLocationUpdater from './hooks/useLocationUpdater'; // Import the custom hook

function MainApp() {
  const [userID, setUserID] = useState(null);
  const currentLocation = useLocation(); // Track changes in route

  // Call the custom hook to update location whenever userID or route changes
  useLocationUpdater(userID, currentLocation); // Pass currentLocation to the custom hook

  return (
    <>
      {currentLocation.pathname !== '/' && currentLocation.pathname !== '/signup' && currentLocation.pathname !== '/signin' && (
        <Navbar userID={userID} />
      )}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home/:userID" element={<HomeWrapper setUserID={setUserID} />} />
        <Route path="/createprofile/:userID" element={<CreateProfile userID={userID} />} />
        <Route path="/userpreferences/:userID" element={<UserPreferencesForm userID={userID} />} />
        <Route path="/messages" element={<Messages userID={userID} />} />
        <Route path="/initiatechat" element={<InitiateChat userID={userID} />} />
        <Route path="/chathistory/:userID" element={<ChatHistory userID={userID} />} />
        <Route path="/profile/:userID" element={<Profile userID={userID} />} />
        <Route path="/chat/:userID" element={<ChatApp />} />
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
