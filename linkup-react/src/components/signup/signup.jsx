import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './signup.css';

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://127.0.0.1:5000/signup', {
                email,
                password,
            });
            setMessage(response.data.message);

            // Assuming the userID is returned in response.data.userID
            const userID = response.data.userID;
            navigate(`/createprofile/${userID}`); // Redirect to createProfile page with userID
        } catch (error) {
            console.error('Error during sign-up:', error.response ? error.response.data : error.message);
        }
    };

    return (
        <div className="container">
            <header className="header">
                <h2 className='header'>Sign Up To Linkup</h2>
            </header>
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
                <button type="submit" className="button">Sign Up</button>
            </form>
            {message && <p className="message">{message}</p>}
        </div>
    );
};

export default SignUp;
