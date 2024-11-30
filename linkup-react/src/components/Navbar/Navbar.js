import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // Optional: create a CSS file for styles
import 'font-awesome/css/font-awesome.min.css'; // Import Font Awesome

const Navbar = ({ userID }) => {
    return (
        <nav>
            <ul>
                <li>
                    <Link to={`/home/${userID}`}><i className="fa fa-home"></i></Link> {/* Home Icon */}
                </li>
                <li>
                    <Link to={`/profile/${userID}`}><i className="fa fa-user"></i></Link> {/* Profile Icon */}
                </li>
                <li>
                    <Link to={`/userpreferences/${userID}`}><i className="fa fa-cogs"></i></Link> {/* Preferences Icon */}
                </li>
                <li>
                    <Link to={`/chatapp/${userID}`}><i className="fa fa-comment"></i></Link> {/* Messages Icon */}
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
