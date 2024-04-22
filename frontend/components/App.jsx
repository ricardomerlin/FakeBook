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
    const [posts, setPosts] = useState([]);
    const [post, setPost] = useState(null);
    const [friends, setFriends] = useState([]);
    const [allMessages, setAllMessages] = useState([]);
    const [allUsers, setAllUsers] = useState([]);

    useEffect(() => {
      fetchComments();
      checkSession();
      fetchFriends();
      fetchPosts();
      fetchAllMessages();
      fetchAllUsers();
    }, []);

    console.log(profile)
  
    useEffect(() => {
      if (profId) {
        fetch(`/api/profiles/${profId}`)
        .then((res) => res.json())
        .then((data) => {
          setProfile(data);
        });
      }
    }, [profId]);

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

    const fetchFriends = async () => {
      const response = await fetch('/api/friends');
      const data = await response.json();
      let friends = [];
      for (let i = 0; i < data.length; i++) {
        if ((data[i].sender_id === profile.id || data[i].receiver_id === profile.id) && data[i].accepted === true) {        
          friends.push(data[i]);
        }
      }
      setFriends(friends);
    }

    const fetchAllUsers = async () => {
      const response = await fetch('/api/profiles');
      const data = await response.json();
      setAllUsers(data);
    }



    const fetchPosts = async () => {
      const response = await fetch('/api/posts');
      const data = await response.json();
      const sortedPosts = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setPosts(sortedPosts);
  };

  const fetchAllMessages = async () => {
    const response = await fetch('/api/messages');
    const data = await response.json();
    setAllMessages(data);
  }


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
            <Route path="/feed" element={<Feed profile={profile} fetchComments={fetchComments} comments={comments} allComments={allComments} posts={posts} fetchPosts={fetchPosts} fetchAllMessages={fetchAllMessages} handlePostAndComments={handlePostAndComments}/>} />
            <Route path="/friends-list" element={<FriendsList profile={profile} friends={friends} allUsers={allUsers} getFriends={fetchFriends}/>} />
            <Route path='/new-post' element={<NewPost profile={profile}/>} />
            <Route path='/extended-comments' element={<ExtendedComments profile={profile} comments={comments} post={post}/>} />
            <Route path='/conversations' element={<Conversations profile={profile} allMessages={allMessages} fetchAllMessages={fetchAllMessages}/>} />
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