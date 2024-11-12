import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // Optional: create a CSS file for styles

const Navbar = ({ userID }) => {
    return (
        <nav>
            <ul>
                <li>
                    <Link to={`/home/${userID}`}>Home</Link>
                </li>
                <li>
                    <Link to={`/profile/${userID}`}>Profile</Link>
                </li>
                <li>
                    <Link to={`/userpreferences/${userID}`}>Preferences</Link>
                </li>
                <li>
                    <Link to={`/chathistory?sender=${userID}`}>Messages</Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
