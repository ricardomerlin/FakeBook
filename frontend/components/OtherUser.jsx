import React, { useEffect, useState } from 'react';
import './app.css';

function OtherUser({ isOpen, onClose, otherUserId }) {
  const [otherUser, setOtherUser] = useState(null);

  useEffect(() => {
    fetchOtherUser()
  }, [otherUserId])

  const fetchOtherUser = async () => {
    const response = await fetch(`/api/profiles/${otherUserId}`);
    const data = await response.json();
    setOtherUser(data);
  }

  const reformatBirthday = (birthday) => {
    const date = new Date(birthday);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  if (!otherUser) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {isOpen && (
      <div className='other-user-modal'>
        <div className='profile-background'></div>
        <div className="profile-container">
          <h2 className="profile-title" style={{marginBottom:'5px'}}>{otherUser.name}</h2>
          <h2 style={{textAlign:'center', marginTop: '0'}} className="profile-username">Username: {otherUser.username}</h2>
          <div className="profile-content">
            <img className="profile-avatar" src={otherUser.profile_picture} alt="user avatar" />
            <p className='profile-birthday'>Born on {reformatBirthday(otherUser.birthday)}</p>
            <p className="profile-email">Email Address: {otherUser.email}</p>
            <p className="profile-bio">{otherUser.description}</p>
          </div>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
      )}
    </>
  );
}

export default OtherUser;