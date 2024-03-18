import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import Profile from './Profile';
import Feed from './Feed';
import LoginForm from "./LoginForm"
import CreateProfile from './CreateProfile';
import NewPost from './NewPost';
import './app.css';

function App() {
    const [profId, setProfId] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loginError, setLoginError] = useState(false);
    const [creatingProfile, setCreatingProfile] = useState(false);

    useEffect(() => {
      checkSession();
    }, []);

    function checkSession() {
      console.log('checking session')
      fetch(`/api/check_session`)
      .then((res) => {
        if (res.ok) {
          res.json().then((user) => setProfile(user));
        } else {
          setProfile(null);
        }
      })
    }

    console.log(profile)

    useEffect(() => {
      fetch(`/api/profiles/${profId}`)
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
      });
    }, [profId]);

    const handleLogin = async (username, password) => {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                },
            body: JSON.stringify({ 
                'username': username,
                'password': password
            }),
    });

    if (response.ok) {
        const data = await response.json();
        setLoginError(false);
        setProfId(data.id);
      } else {
        const errorData = await response.json().catch(() => null); 
            console.log('Error:', errorData);
            setLoginError(true);
    }
    };

    const handleLogout = async () => {
      const response = await fetch('/api/logout', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
      });
  
      if (response.ok) {
          setProfile(null);

      } else {
        const errorData = await response.json().catch(() => null); 
            console.log('Error:', errorData);
            setLoginError(true);
      }
  };
  
    const handlePostCreated = (newPost) => {
        console.log(newPost)
    }

    const checkCreatingProfile = async () => {
        setCreatingProfile(!creatingProfile);
    }


  return (
    <Router>
      {profile ? (
        <>
          <nav>
            <Link to="/profile">Profile</Link>
            <Link to="/feed">Feed</Link>
            <Link to="/login" onClick={handleLogout}>Logout</Link>
          </nav>
          <Routes>
            <Route path="/" element={<Feed profile={profile}/>} />
            <Route path="/profile" element={<Profile profile={profile} />} />
            <Route path="/feed" element={<Feed profile={profile}/>} />
            <Route path='/new-post' element={<NewPost profile={profile} onPostCreated={handlePostCreated}/>} />
          </Routes>
        </>
      ) : (
        <>
            {creatingProfile ? <CreateProfile profId={profId} checkCreatingProfile={checkCreatingProfile} onLogin={handleLogin}/> : <LoginForm onLogin={handleLogin} checkCreatingProfile={checkCreatingProfile}loginError={loginError}/> }
        </>
      )}
    </Router>
  );
}

export default App;