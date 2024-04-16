import React, { useState, useEffect } from 'react';
import OtherUser from './OtherUser';

function FriendsList({ profile, friends, getFriends }) {
  const [newRequests, setNewRequests] = useState([]);
  const [otherUserId, setOtherUserId] = useState(0);
  
  useEffect(() => {
    getFriendRequests();
    if (friends.length === 0) {
      getFriendsFromApp();
    }
  }, []);
  
  const getFriendRequests = async () => {
    const response = await fetch('/api/friends');
    const data = await response.json();
    let requests = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i].recipient_id === profile.id && data[i].accepted === false) {
        console.log(data[i])
        requests.push(data[i]);
      }
    }
    setNewRequests(requests);
    console.log('done')
  }
  
  
  const acceptFriendRequest = async (request) => {
    const response = await fetch(`/api/friends/${request.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accepted: true
      })
    });
    if (response.ok) {
      getFriendRequests();
      getFriendsFromApp();
    } else {
      console.log('Error accepting friend request');
    }
  }

  const getFriendsFromApp = async () => {
    getFriends()
  }
  
  const declineFriendRequest = async (request) => {
    const response = await fetch(`/api/friends/${request.id}`, {
      method: 'DELETE'
    });
    if (response.ok) {
      getFriendRequests();
    } else {
      console.log('Error declining friend request');
    }
  }

  const deleteFriend = async (friend) => {
    const response = await fetch(`/api/friends/${friend.id}`, {
      method: 'DELETE'
    });
    if (response.ok) {
      getFriendsFromApp();
    } else {
      console.log('Error deleting friend');
    }
  }

const mappedFriendRequests = newRequests.map((request) => {
  return (
    <div key={request.id} className='friend-request'>
      <h3 onClick={() => handleOpenOtherUser(request.self_id === profile.id ? request.other_user_id : request.self_id)}>{request.sender_name}</h3>
      <div className='friend-request-actions'>
        <a href='#' className='accept-button' onClick={() => acceptFriendRequest(request)}>Accept</a>
        <a href='#' className='decline-button' onClick={() => declineFriendRequest(request)}>Decline</a>
      </div>
    </div>
  )
})

  const reformatCreatedAt = (date) => {
    const dateObj = new Date(date);
    const month = dateObj.toLocaleString('default', { month: 'long' });
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();
    return `${month} ${day}, ${year}`;
  }

  const mappedFriends = friends.map((friend) => {
    return (
      <div key={friend.id} className='friend'>
      <img 
        src={
          ((friend.self_id === profile.id) ? friend.recipient_profile_picture : friend.self_profile_picture) 
          ? `data:image/jpeg;base64,${friend.self_id === profile.id ? friend.recipient_profile_picture : friend.self_profile_picture}` 
          : 'https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_640.png'
        } 
        alt='profile picture' 
        className='friend-profile-picture-friends-tab'
      />
      <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
        <h2 className='friend-name-header' onClick={() => handleOpenOtherUser(friend.self_id === profile.id ? friend.other_user_id : friend.self_id)}>{friend.self_id === profile.id ? friend.recipient_name : friend.sender_name}</h2>
        <p>Friends since {reformatCreatedAt(friend.added_at)}</p>
      </div>
        <a href='#' onClick={() => deleteFriend(friend)}>Remove friend</a>
      </div>
    )
  })

  const handleOpenOtherUser = (userId) => {
    if (userId === profile.id) {
        return;
    }
    setOtherUserId(userId);
  };

  const handleCloseOtherUser = () => {
      setOtherUserId(0);
  };

  return (
    <div>
      <div className='friends-background'></div>
      <h1 className='friends-header' style={{paddingTop: '50px', textAlign: 'center'}}>Friends</h1>
      <div className='friends-container'>
        {(newRequests.length > 0) ? 
        <div className="friend-requests-container">New requests
          {mappedFriendRequests}
        </div>
        :
        null
        }
        <h1>Friends List</h1>
        <div className='friends-list'>
          {mappedFriends}
        </div>
      </div>
      <OtherUser
                isOpen={otherUserId > 0}
                otherUserId={otherUserId}
                profile={profile}
                onClose={handleCloseOtherUser}
      />
    </div>
  );
}

export default FriendsList;