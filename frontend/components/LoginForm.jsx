import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './app.css';

function LoginForm({ onLogin, loginError, checkCreatingProfile }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        onLogin(username, password);
        goToFeed();
    };

    const goToFeed = () => {
        navigate('/feed');
    }

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const goToCreateProfile = () => {
        checkCreatingProfile(true);
    }

    return (
        <div className="login-form-container">
            <h2>Welcome to FakeBook!</h2>
            <p>Enter the world of FakeBook by logging into your account. Connect with friends, share your moments, and discover what's happening around the world.</p>
            <form onSubmit={handleSubmit} className="login-form">
                <label className='login-input-container'>
                    <span className="login-label">Username:</span>
                    <input type="text" className="login-input" value={username} onChange={(e) => setUsername(e.target.value)} />
                </label>
                <label className='login-input-container'>
                    <span className="login-label">Password:</span>
                    <input type={isPasswordVisible ? "text" : "password"} className="login-input" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="button" className='showpassword-button' onClick={togglePasswordVisibility}>
                        {isPasswordVisible ? 'Hide password' : 'Show password'}
                    </button>
                </label>
                <button type="submit" className="login-button">Sign in</button>
            </form>
            {loginError ? <p className="login-error">Oops! The username or password you entered doesn't match our records. Please try again.</p> : null}
            <h3>New to FakeBook? <button className='signup-account-button' onClick={goToCreateProfile}>Create your account and start your journey!</button></h3>
        </div>
    );
}
    
export default LoginForm;