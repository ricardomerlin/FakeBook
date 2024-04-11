import React, { useEffect, useState } from 'react';
import './app.css';

function OtherUser({ profile, isOpen, onClose, otherUserId }) {
  const [otherUser, setOtherUser] = useState(null);
  const [requestSent, setRequestSent] = useState(false);


  console.log(profile)

  useEffect(() => {
    fetchOtherUser()
  }, [otherUserId])

  useEffect(() => {
    checkFriendRequest()
  }, [otherUser])

  const fetchOtherUser = async () => {
    const response = await fetch(`/api/profiles/${otherUserId}`);
    const data = await response.json();
    setOtherUser(data);
  }

  const checkFriendRequest = async () => {
    const response = await fetch(`/api/friends`);
    const data = await response.json();
    if (data.some(friendship => 
        (friendship.profile_id === profile.id && friendship.friend_id === otherUser.id) ||
        (friendship.profile_id === otherUser.id && friendship.friend_id === profile.id))) {
      setRequestSent(true);
    }
  }
  

  const reformatBirthday = (birthday) => {
    const date = new Date(birthday);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  if (!otherUser) {
    return <div>Loading...</div>;
  }

  const addFriend = async () => {
    const response = await fetch(`/api/friends`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        profile_id: profile.id,
        friend_id: otherUser.id
      }),
    });
    if (response.ok) {
      console.log('Friend request sent');
    } else {
      console.error('Failed to send friend request');
    }
    checkFriendRequest();
  }

  const removeFriend = async () => {
    try {
      const response = await fetch(`/api/friends/${profile.id}&${otherUser.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        console.log('Friendship deleted successfully');
      } else {
        console.error('Failed to delete friendship');
      }
    } catch (error) {
      console.error('Error deleting friendship:', error);
    }
  };
  

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
            {requestSent ? <h3>Friend request sent! <button onClick={removeFriend}>Unsend</button></h3> : <button className='friend-request' onClick={addFriend}>Send Friend Request</button> }
          </div>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
      )}
    </>
  );
}

export default OtherUser;