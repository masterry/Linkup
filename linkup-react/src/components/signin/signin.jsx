import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './signin.css';

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage('');

        try {
            const response = await axios.post('https://linkup-dating-2e181815b60e.herokuapp.com/signin', {
                email,
                password,
            });

            setMessage(response.data.message);
            const token = response.data.token;
            console.log('Token:', token);
            const userID = response.data.userID;

            // Redirect to homepage on successful sign-in
            navigate(`/home/${userID}`); // Adjust the path based on your homepage route
        } catch (error) {
            console.error('Error during sign-in:', error.response ? error.response.data : error.message);
        }
    };

    const handleSignUpClick = () => {
        navigate('/signup');
    };

    return (
        <div className="container">
            <h2 className="header">Welcome to Linkup</h2>
            <form onSubmit={handleSubmit} className="form">
                <div className="inputContainer">
                    <label className="label">Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="input"
                    />
                </div>
                <div className="inputContainer">
                    <label className="label">Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="input"
                    />
                </div>
                <button type="submit" className="button">Sign In</button>
            </form>
            {message && <p className="message">{message}</p>}
            <div className="buttonContainer">
                <button onClick={handleSignUpClick} className="button">Sign Up</button>
            </div>
        </div>
    );
};

export default SignIn;
