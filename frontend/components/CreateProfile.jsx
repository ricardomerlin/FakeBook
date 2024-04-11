import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function CreateProfile({ checkCreatingProfile, onLogin }) {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [birthday, setBirthday] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [description, setDescription] = useState('');

    const [confirmPassword, setConfirmPassword] = useState('')

    const navigate = useNavigate();

    console.log(profilePicture)

    const goToFeed = () => {
        navigate('/feed');
    }

    const handleLoginSubmit = async () => {
        checkCreatingProfile(false);
        onLogin(username, password);
        goToFeed();
    };

    const handleConfirmPasswordChange = (event) => {
        setConfirmPassword(event.target.value);
    }

    const cancelCreateProfile = () => {
        checkCreatingProfile(false);
    }

    const submitNewProfile = async (event) => {
        event.preventDefault()
        if (password !== confirmPassword) {
            alert('Passwords do not match')
            return;
        }
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('username', username);
        formData.append('password', password);
        formData.append('birthday', birthday);
        formData.append('profile_picture', profilePicture);
        formData.append('description', description);
    
        const response = await fetch('/api/profiles', {
            method: 'POST',
            body: formData
        });

        
        if (response.ok) {
            const data = await response.json();
            checkCreatingProfile(false);
            handleLoginSubmit();

        } else {
            console.error('Failed to create profile');
        }
    }
    
    console.log(profilePicture)

    return (
    <div>
        <div className="create-profile-background"></div>
        <div className="create-profile-container">
        <h1>Create Profile</h1>
        <form className="create-profile-form" onSubmit={submitNewProfile}>
            <label>
            Name:
            <input type="text" name="name" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label>
            Email:
            <input type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label>
            Username:
            <input type="text" name="username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </label>
            <label>
            Password:
            <input type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            <label>
            Confirm password:
            <input type="password" name="confirm-password" value={confirmPassword} onChange={handleConfirmPasswordChange}/>
            </label>
            <label>
            Birthday:
            <input type="date" name="birthday" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
            </label>
            <label>
            Profile Picture:
            <input type="file" accept="image/*" onChange={(e) => setProfilePicture(e.target.files[0])} />
            </label>
            <label>
            Description:
            <textarea name="description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </label>
            <div className='create-profile-buttons'>
                <button type="submit">Create Profile</button>
            </div>
        </form>
        <button className="back-button" onClick={cancelCreateProfile}>Back to Login</button>
        </div>
    </div>
    );
}

export default CreateProfile;