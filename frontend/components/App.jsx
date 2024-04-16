import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import Profile from './Profile';
import Feed from './Feed';
import LoginForm from "./LoginForm"
import CreateProfile from './CreateProfile';
import NewPost from './NewPost';
import ExtendedComments from './ExtendedComments';
import Conversations from './Conversations';
import FriendsList from './FriendsList';
import './app.css';

function App() {
    const [profId, setProfId] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loginError, setLoginError] = useState(false);
    const [creatingProfile, setCreatingProfile] = useState(false);
    const [allComments, setAllComments] = useState([]);
    const [comments, setComments] = useState([]);
    const [post, setPost] = useState(null);

    useEffect(() => {
      fetchComments();
      checkSession();
    }, []);

    console.log(creatingProfile)

    const checkSession = async () => {
      console.log('I am checking session')
      const response = await fetch('/api/check_session');
      if (response.ok) {
          console.log('session is good')
          const data = await response.json();
          console.log(data)
          console.log(data)
          setProfile(data);
          fetchComments();
      } else {
          console.log('session is bad')
          setProfile(null);
      }
  }

    const handlePostAndComments = (comments, post) => {
        setComments(comments)
        setPost(post)
    }

    useEffect(() => {
      if (profId) {
        fetch(`/api/profiles/${profId}`)
        .then((res) => res.json())
        .then((data) => {
          setProfile(data);
        });
      }
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
        checkCreatingProfile(false);
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
          setComments([]);
          setPost(null);
      } else {
        const errorData = await response.json().catch(() => null); 
            console.log('Error:', errorData);
            setLoginError(true);
      }
  };

    const checkCreatingProfile = (value) => {
        setCreatingProfile(value);
    }

    const fetchComments = async () => {
      const response = await fetch(`/api/comments`);
      const data = await response.json();
      setAllComments(data);
  };

  return (
    <Router>
      {profile ? (
        <>
          <nav>
            <Link to="/profile">Profile</Link>
            <Link to="/feed">Feed</Link>
            <Link to="/conversations">Messages</Link>
            <Link to="/friends-list">Friends</Link>
            <Link to="/login" onClick={handleLogout} checkCreatingProfile={checkCreatingProfile}>Logout</Link>
          </nav>
          <Routes>
            <Route path="/" element={<Feed profile={profile} fetchComments={fetchComments} comments={comments} allComments={allComments} handlePostAndComments={handlePostAndComments}/>} />
            <Route path="/profile" element={<Profile profile={profile} />} />
            <Route path="/feed" element={<Feed profile={profile} fetchComments={fetchComments} comments={comments} allComments={allComments} handlePostAndComments={handlePostAndComments}/>} />
            <Route path="/friends-list" element={<FriendsList profile={profile} />} />
            <Route path='/new-post' element={<NewPost profile={profile}/>} />
            <Route path='/extended-comments' element={<ExtendedComments profile={profile} comments={comments} post={post}/>} />
            <Route path='/conversations' element={<Conversations profile={profile} />} />
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