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
import { render } from 'react-dom';

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
      checkSession();
      fetchAllComments();
      fetchAllPosts();
      fetchAllMessages();
      fetchAllUsers();
    }, []);
  
    useEffect(() => {
      if (profId) {
        getProfile();
      }
    }, [profId]);

    useEffect(() => {
      getFriends();
    }, [profile])

    const getProfile = async () => {
      const response = await fetch(`/api/profiles/${profId}`);
      const data = await response.json();
      setProfile(data);
    }

    const checkSession = async () => {
      const response = await fetch('/api/check_session');
      if (response.ok) {
          console.log('session is good')
          const data = await response.json();
          console.log(data)
          setProfile(data);
          fetchAllComments();
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

    
  const getFriends = () => {
    if (profile) {
      const receivedRequests = profile.received_friend_requests || [];
      const sentRequests = profile.sent_friend_requests || [];
      const acceptedReceivedRequests = receivedRequests.filter(friend => friend.accepted === true);
      const acceptedSentRequests = sentRequests.filter(friend => friend.accepted === true);
      setFriends([...acceptedReceivedRequests, ...acceptedSentRequests]);
    }
  };
  
  const fetchAllUsers = async () => {
    const response = await fetch('/api/profiles');
    const data = await response.json();
    setAllUsers(data);
  }

  const fetchAllComments = async () => {
    const response = await fetch(`/api/comments`);
    const data = await response.json();
    setAllComments(data);
  };

  const fetchAllPosts = async () => {
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

console.log(posts)

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
            <Route path="/" element={<Feed profile={profile} fetchAllComments={fetchAllComments} comments={comments} allComments={allComments} handlePostAndComments={handlePostAndComments}/>} />
            <Route path="/profile" element={<Profile profile={profile} posts={posts}/>} />
            <Route path="/feed" element={<Feed profile={profile} fetchAllComments={fetchAllComments} comments={comments} allComments={allComments} posts={posts} fetchAllPosts={fetchAllPosts} fetchAllMessages={fetchAllMessages} handlePostAndComments={handlePostAndComments}/>} />
            <Route path="/friends-list" element={<FriendsList profile={profile} friends={friends} allUsers={allUsers} getFriends={getFriends} getProfile={getProfile} />} />
            <Route path='/new-post' element={<NewPost profile={profile} fetchAllPosts={fetchAllPosts}/>} />
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