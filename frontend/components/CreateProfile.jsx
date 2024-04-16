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
    const [imageUploaded, setImageUploaded] = useState(false);

    const [confirmPassword, setConfirmPassword] = useState('')

    const navigate = useNavigate();

    const goToFeed = () => {
        navigate('/feed');
    }

    const handleLoginSubmit = () => {
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

    const handleImageUpload = (e) => {
        setProfilePicture(e.target.files[0]);
        setImageUploaded(true);
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
            cancelCreateProfile();
            handleLoginSubmit();

        } else {
            console.error('Failed to create profile');
        }
    }

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
            <div style={{display: 'flex', justifyContent: 'center', marginTop: '10px'}}>
                <label className='custom-file-upload-new-profile'>
                Upload your profile picture here
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{display: 'none'}}/>
                </label>
            </div>
            {imageUploaded && <p style={{textAlign: 'center', marginTop: '-5px', marginBottom: '20px'}}>Image uploaded successfully!</p>}
            <label style={{marginTop: '10px'}}>
            Tell us about yourself (hobbies? interests? favorite teams?):
            <textarea name="description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </label>
            <div className='create-profile-button'>
                <button type="submit">Create Profile</button>
            </div>
        </form>
        <button className="back-button" onClick={cancelCreateProfile}>Back to Login</button>
        </div>
    </div>
    );
}

export default CreateProfile;