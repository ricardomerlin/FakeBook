import React, { useEffect, useState } from 'react';
import ProfilePost from './ProfilePost.jsx';
import { useNavigate } from 'react-router-dom';
import './app.css';

function Profile({ profile }) {
  const [posts, setPosts] = useState([]);

  const navigate = useNavigate();

  // useEffect(() => {
  //   const fetchUserData = async () => {
  //     const response = await fetch(`h/profiles/${profId}`);
  //     const data = await response.json();
  //     setUserData(data);
  //   };
  //   fetchUserData();
  // }, [profile]);

  useEffect(() => {
    fetchPosts();
  }, [profile]);

  const fetchPosts = async () => {
    const response = await fetch('/api/posts');
    const data = await response.json();
    setPosts(data);
    console.log(posts)
  };
  
  if (!profile) {
    return <div>Loading...</div>;
  }

  const travelNewPost = () => {
    navigate('/new-post');
  };

  return (
  <div>
    <div className='profile-background'></div>
    <div className="profile-container">
      <h2 className="profile-title">Profile Page</h2>
      <div className="profile-content">
        <img className="profile-avatar" src={profile.profile_picture} alt="user avatar" />
        <p className="profile-name">Name: {profile.name}</p>
        <p className="profile-username">Username: {profile.username}</p>
        <p className='profile-birthday'>Born on {profile.birthday}</p>
        <p className="profile-email">Email: {profile.email}</p>
        <p className="profile-bio">{profile.description}</p>
        <div className='profile-posts-container'>
        {posts.filter(post => post.profile_id === profile.id).map(post => (
          <ProfilePost key={post.id} post={post} profile={profile} fetchPosts={fetchPosts}/>
        ))}
        </div>
      </div>
      <button className="floating-button" onClick={travelNewPost}>New Post</button>
  </div>
  </div>
  );
}

export default Profile;