import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignUp from "./components/signup/signup";
import SignIn from './components/signin/signin';
import HomePage from './components/home/home';
import CreateProfile from './components/createprofile/createProfile';
import UserPreferencesForm from './components/UserPreferencesForm/UserPreferencesForm';
import Messages from './components/messages/messages';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home/:userID" element={<HomePage />} />
        <Route path="/createprofile/:userID" element={<CreateProfile />} />
        <Route path="/userpreferences/:userID" element={<UserPreferencesForm />} />
        <Route path="/messages" element={<Messages />} />
      </Routes>
    </Router>
  );
}

export default App;