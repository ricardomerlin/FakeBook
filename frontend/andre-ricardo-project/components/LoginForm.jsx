import React, { useState } from 'react';
import './app.css';

function LoginForm({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (event) => {
    event.preventDefault();
    onLogin(username, password);
    console.log(username)
    console.log(password)
    };

    return (
        <div className="login-form-container">
            <form onSubmit={handleSubmit} className="login-form">
                <label>
                Username:
                <input type="text" className="login-input" value={username} onChange={(e) => setUsername(e.target.value)} />
                </label>
                <label>
                Password:
                <input type="password" className="login-input" value={password} onChange={(e) => setPassword(e.target.value)} />
                </label>
                <button type="submit" className="login-button">Log in</button>
            </form>
        </div>
    );
}
    
export default LoginForm;