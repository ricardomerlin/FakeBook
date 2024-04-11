import React, { useEffect, useState } from 'react';
import './app.css';

function OtherUser({ profile, isOpen, onClose, otherUserId }) {
  const [otherUser, setOtherUser] = useState(null);
  const [requestStatus, setRequestStatus] = useState(0);

  // console.log(profile)
  // console.log(otherUser)
  // console.log(otherUserId)

  useEffect(() => {
    fetchOtherUser()
  }, [otherUserId])
  
  useEffect(() => {
    checkFriendRequest()
    if (otherUser) {
      checkRequestReceived()
      checkFriends()
    }
  }, [otherUser])

  const fetchOtherUser = async () => {
    const response = await fetch(`/api/profiles/${otherUserId}`);
    const data = await response.json();
    setOtherUser(data);
  }

  const checkFriendRequest = async () => {
    console.log
    const response = await fetch(`/api/friends`);
    const data = await response.json();
    if (data.some(friendship => friendship.self_id === profile.id && friendship.recipient_id === otherUser.id && friendship.accepted === false)) {
      console.log('Friend request already sent')
      setRequestStatus(1);
    }
  }

  const checkFriends = async () => {
    const response = await fetch(`/api/friends`);
    const data = await response.json();
    if (data.some(friendship => (friendship.self_id === profile.id && friendship.recipient_id === otherUser.id) || (friendship.self_id === otherUser.id && friendship.recipient_id === profile.id) && friendship.accepted === true)) {
      setRequestStatus(3);
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
        sender_name: profile.name,
        recipient_name: otherUser.name,
        self_id: profile.id,
        recipient_id: otherUser.id
      }),
    });
    if (response.ok) {
      console.log('Friend request sent');
      checkFriendRequest();
    } else {
      console.error('Failed to send friend request');
    }
  }

  const checkRequestReceived = async () => {
    const response = await fetch(`/api/friends`);
    const data = await response.json();
    if (data.some(friendship => friendship.self_id === otherUser.id && friendship.recipient_id === profile.id && friendship.accepted === false)) {
      console.log('Friend request already received')
      setRequestStatus(2);
    }
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
        setRequestStatus(0);
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
            {requestStatus == 1 ? <h3>Friend request sent! <button onClick={removeFriend}>Unsend</button></h3> : requestStatus == 0 ? <button className='friend-request' onClick={addFriend}>Send Friend Request</button> : requestStatus == 3 ? <h3>You and {otherUser.name} are already friends.</h3> : <h3>{otherUser.name} sent you a friend request! Check your requests!</h3>}
          </div>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
      )}
    </>
  );
}

export default OtherUser;