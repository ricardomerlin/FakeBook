import React, { useEffect, useState } from 'react';
import Post from './Post.jsx';
import './app.css';

function Profile({ profId }) {
  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);

    console.log(profId)
    profId = 4

  useEffect(() => {
    const fetchUserData = async () => {
      const response = await fetch(`http://127.0.0.1:5555/profiles/${profId}`);
      const data = await response.json();
      setUserData(data);
    };
    fetchUserData();
  }, [profId]);

  useEffect(() => {
    const fetchPosts = async () => {
      const response = await fetch('http://127.0.0.1:5555/posts');
      const data = await response.json();
      setPosts(data);
      console.log(posts)
    };
    fetchPosts();
  }, [profId]);

  if (!userData) {
    return <div>Loading...</div>;
  }

  console.log(profId)

  return (
    <div className="profile">
      <h2 className="profile-title">Profile Page</h2>
      <div className="profile-content">
        <img className="profile-avatar" src={userData.profile_picture} alt="user avatar" />
        <p className="profile-name">Name: {userData.name}</p>
        <p className="profile-username">Username: {userData.username}</p>
        <p className='profile-birthday'>Born on {userData.birthday}</p>
        <p className="profile-email">Email: {userData.email}</p>
        <p className="profile-bio">{userData.description}</p>
        {posts.filter(post => post.profile_id === profId).map(post => (
          <Post key={post.id} post={post} userData={userData}/>
        ))}
      </div>
    </div>
  );
}

export default Profile;