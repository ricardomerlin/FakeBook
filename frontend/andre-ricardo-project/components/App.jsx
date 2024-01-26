import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import Profile from './Profile';
import Feed from './Feed';
import LoginForm from "./LoginForm"
import './app.css';
import NewPost from './NewPost';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [profId, setProfId] = useState(2)

    const handleLogin = async (username, password) => {
        const response = await fetch('http://127.0.0.1:5555/login', {
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
        setIsLoggedIn(true);
            setProfId(data.id);
            } else {
            const errorData = await response.json().catch(() => null); 
                console.log('Error:', errorData);
    }
    };
  
    const handlePostCreated = (newPost) => {
        console.log(newPost)
    }

  return (
    <Router>
      {isLoggedIn ? (
        <>
          <nav>
            <Link to="/profile">Profile</Link>
            <Link to="/feed">Feed</Link>
            <Link to="/login" onClick={() => setIsLoggedIn(false)}>Logout</Link>
          </nav>
          <Routes>
            <Route path="/profile" element={<Profile profId={profId} />} />
            <Route path="/feed" element={<Feed />} />
            <Route path='/login' element={<LoginForm onLogin={() => setIsLoggedIn(false)} />} />
            <Route path='/new-post' element={<NewPost onPostCreated={handlePostCreated}/>} />
          </Routes>
        </>
      ) : (
        <LoginForm onLogin={handleLogin} />
      )}
    </Router>
  );
}

export default App;