// Logo/Logo.js
import React from 'react';
import logo from '/Users/terrykhoury/Documents/GitHub/Linkup/linkup-react/src/assets/images/69DCC479-9A5E-4A49-8FC6-CB8C95B9150C.PNG';
import './Logo.css';  // If you have a specific CSS file for the Logo component

const Logo = () => {
  return <img src={logo} alt="LinkUp Logo" className="logo" />;
};

export default Logo;
