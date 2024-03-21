import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import Profile from './Profile';
import Feed from './Feed';
import LoginForm from "./LoginForm"
import CreateProfile from './CreateProfile';
import NewPost from './NewPost';
import ExtendedComments from './ExtendedComments';
import './app.css';

function App() {
    const [profId, setProfId] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loginError, setLoginError] = useState(false);
    const [creatingProfile, setCreatingProfile] = useState(false);
    const [allComments, setAllComments] = useState([]);
    const [comments, setComments] = useState([]);
    const [post, setPost] = useState(null);

  console.log('profId',profId)
  console.log('profile', profile)


    useEffect(() => {
      checkSession();
    }, []);

    const checkSession = async () => {
      console.log('I am checking session')
      const response = await fetch('/api/check_session');
      if (response.ok) {
          const data = await response.json();
          setProfile(data);
          fetchComments();
      } else {
          setProfile(null);
      }
  }

  console.log(profile)

    const handlePostAndComments = (comments, post) => {
        setComments(comments)
        setPost(post)
    }

    console.log(profile)

    useEffect(() => {
      fetch(`/api/profiles/${profId}`)
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
      });
    }, [profId]);

    console.log('profile:',profile)

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

    console.log(comments)

    const handleLogout = async () => {
      const response = await fetch('/api/logout', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
      });
  
      if (response.ok) {
          setProfile(null);
          setComments([]);
          setPost(null);
      } else {
        const errorData = await response.json().catch(() => null); 
            console.log('Error:', errorData);
            setLoginError(true);
      }
  };
  
    const handlePostCreated = (newPost) => {
        console.log(newPost)
    }

    const checkCreatingProfile = async (value) => {
        setCreatingProfile(value);
    }

    console.log(creatingProfile)

    const fetchComments = async () => {
      const response = await fetch(`/api/comments`);
      const data = await response.json();
      setAllComments(data);
  };

    console.log('creating profile?:',creatingProfile)


    console.log(loginError)

  return (
    <Router>
      {profile ? (
        <>
          <nav>
            <Link to="/profile">Profile</Link>
            <Link to="/feed">Feed</Link>
            <Link to="/login" onClick={handleLogout} checkCreatingProfile={checkCreatingProfile}>Logout</Link>
          </nav>
          <Routes>
            <Route path="/" element={<Feed profile={profile} comments={comments} allComments={allComments}/>} />
            <Route path="/profile" element={<Profile profile={profile} />} />
            <Route path="/feed" element={<Feed profile={profile} fetchComments={fetchComments} comments={comments} allComments={allComments} handlePostAndComments={handlePostAndComments}/>} />
            <Route path='/new-post' element={<NewPost profile={profile} onPostCreated={handlePostCreated}/>} />
            <Route path='/extended-comments' element={<ExtendedComments profile={profile} comments={comments} post={post}/>} />
          </Routes>
        </>
      ) : (
        <>
            {creatingProfile ? <CreateProfile profId={profId} checkCreatingProfile={checkCreatingProfile} onLogin={handleLogin}/> : <LoginForm onLogin={handleLogin} checkCreatingProfile={checkCreatingProfile} loginError={loginError}/> }
        </>
      )}
    </Router>
  );
}

export default App;