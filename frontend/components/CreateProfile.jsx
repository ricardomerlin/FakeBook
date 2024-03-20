import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function CreateProfile({ checkCreatingProfile, onLogin }) {
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        username: '',
        password: '',
        birthday: '',
        profile_picture: '',
        description: ''
    });

    const navigate = useNavigate();

    const goToFeed = () => {
        navigate('/feed');
    }

    const handleLoginSubmit = async () => {
        checkCreatingProfile(false);
        onLogin(profile.username, profile.password);
        goToFeed();
    };

    const handleChange = (event) => {
        setProfile({
            ...profile,
            [event.target.name]: event.target.value,
        });
    };

    const cancelCreateProfile = () => {
        checkCreatingProfile(false);
    }

    console.log(profile)
    console.log(checkCreatingProfile)

    const submitNewProfile = async (event) => {
        event.preventDefault()
        console.log('submitting profile')
        const response = await fetch('/api/profiles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: profile.name,
                email: profile.email,
                username: profile.username,
                password: profile.password,
                birthday: profile.birthday,
                profile_picture: profile.profile_picture,
                description: profile.description
            })
        });
        if (response.ok) {
            const data = await response.json();
            checkCreatingProfile(false);
            handleLoginSubmit();
        } else {
            console.error('Failed to create profile');
        }
    }

    return (
    <div>
        <div className="full-page-background"></div>
        <div className="create-profile-container">
        <h1>Create Profile</h1>
        <form className="create-profile-form" onSubmit={submitNewProfile}>
            <label>
            Name:
            <input type="text" name="name" value={profile.name} onChange={handleChange} />
            </label>
            <label>
            Email:
            <input type="email" name="email" value={profile.email} onChange={handleChange} />
            </label>
            <label>
            Username:
            <input type="text" name="username" value={profile.username} onChange={handleChange} />
            </label>
            <label>
            Password:
            <input type="password" name="password" value={profile.password} onChange={handleChange} />
            </label>
            <label>
            Birthday:
            <input type="date" name="birthday" value={profile.birthday} onChange={handleChange} />
            </label>
            <label>
            Profile Picture URL:
            <input type="text" name="profile_picture" value={profile.profile_picture} onChange={handleChange} />
            </label>
            <label>
            Description:
            <textarea name="description" value={profile.description} onChange={handleChange} />
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