import React, { useEffect, useState } from 'react';
import ProfilePost from './ProfilePost.jsx';
import { useNavigate } from 'react-router-dom';
import './app.css';

function Profile({ profile, posts }) {
  // const [posts, setPosts] = useState([]);

  const navigate = useNavigate();

  // useEffect(() => {
  //   fetchAllPosts();
  // }, [profile]);

  
  if (!profile) {
    return <div>Loading...</div>;
  }

  console.log(posts)

  const travelNewPost = () => {
    navigate('/new-post');
  };

  const reformatBirthday = (birthday) => {
    const date = new Date(birthday);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  return (
  <div>
    <div className='profile-background'></div>
    <div className="profile-container">
      <h2 className="profile-title" style={{marginBottom:'5px'}}>{profile.name}</h2>
      <h2 style={{textAlign:'center', marginTop: '0'}}className="profile-username">{profile.username}</h2>
      <div className="profile-content">
        { profile.profile_picture ? <img className="profile-avatar" src={`data:image/jpeg;base64,${profile.profile_picture}`} alt="user avatar" /> : <img className="profile-avatar" style={{backgroundColor: 'white'}} src='https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_640.png' alt="user avatar" />}
        <p className='profile-birthday'>Born on {reformatBirthday(profile.birthday)}</p>
        <p className="profile-email">Email Address: {profile.email}</p>
        <p className="profile-bio">{profile.description}</p>
        <h2 style={{textAlign: 'center', fontSize: '11px'}}>Need to make changes to your profile?<br/><a href='#' style={{margin: '10px'}}>Edit your profile here.</a></h2>
        {posts && posts.length == 0 ? null : <h3>Click on an image to view your post!</h3>}
        <div className='profile-posts-container'>
        {posts && posts.length > 0 ?
        posts.filter(post => post.profile_id === profile.id).map(post => (
          <ProfilePost key={post.id} post={post} profile={profile}/>
        ))
        :
          <div style={{display: 'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', marginTop: '20px', textAlign: 'center'}}>
              <h3>Create your first post with the button at the bottom right of your screen!</h3>
              <img className='dog-silly' src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdmjQ0OCscE5badyvtZfShqdMIMFMw8_wAvg&s'/>
          </div>
        }
        </div>
      </div>
      <button className="floating-button" onClick={travelNewPost}>New Post</button>
  </div>
  </div>
  );
}

export default Profile;