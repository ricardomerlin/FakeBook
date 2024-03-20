// LoginForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './app.css';

function LoginForm({ onLogin, loginError, checkCreatingProfile }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        console.log('login form submitted')
        event.preventDefault();
        onLogin(username, password);
        goToFeed();
    };

    const goToFeed = () => {
        console.log('I am going to the feed')
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
            <p>Please login to your account to continue, or create an account if you don't have one yet..</p>
            <form onSubmit={handleSubmit} className="login-form">
                <label className='login-input-container'>
                    Username:
                    <input type="text" className="login-input" value={username} onChange={(e) => setUsername(e.target.value)} />
                </label>
                <label className='login-input-container'>
                    Password:
                    <input type={isPasswordVisible ? "text" : "password"} className="login-input" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="button" className='showpassword-button' onClick={togglePasswordVisibility}>
                        {isPasswordVisible ? 'Hide password' : 'Show password'}
                    </button>
                </label>
                <button type="submit" className="login-button">Log in</button>
            </form>
            {loginError ? <p style={{color:'red'}}>Username or password do not match known account.</p> : null}
            <h3>Don't have an account? <button onClick={goToCreateProfile}>Sign up here</button></h3>
        </div>
    );
}
    
export default LoginForm;