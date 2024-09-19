import React, { useState } from 'react';
import axios from 'axios';
import './signin.css';

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage('');

        try {
            const response = await axios.post('http://127.0.0.1:5000/signin', {
                email,
                password,
            });

            setMessage(response.data.message);
            // You can also store the token if needed
            const token = response.data.token;
            console.log('Token:', token);
        } catch (error) {
            if (error.response) {
                setMessage(error.response.data.message);
            } else {
                setMessage('An unexpected error occurred.');
            }
        }
    };

    return (
        <div className="container">
            <h2 className="header">Sign In</h2>
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
        </div>
    );
};

export default SignIn;
