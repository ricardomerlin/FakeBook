import React, { useState, useEffect } from 'react';

function FriendsList({ profile }) {
  const [newRequests, setNewRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  
  useEffect(() => {
    getFriendRequests();
    getFriends();
  }, []);

  console.log(profile)
  console.log(newRequests)
  console.log(friends)

  
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
  
  const getFriends = async () => {
    const response = await fetch('/api/friends');
    const data = await response.json();
    let friends = [];
    for (let i = 0; i < data.length; i++) {
      if ((data[i].self_id === profile.id || data[i].recipient_id === profile.id) && data[i].accepted === true) {        
        friends.push(data[i]);
      }
    }
    setFriends(friends);
    getFriendRequests();
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
      getFriends();
    } else {
      console.log('Error accepting friend request');
    }
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
      getFriends();
    } else {
      console.log('Error deleting friend');
    }
  }

const mappedFriendRequests = newRequests.map((request) => {
  return (
    <div key={request.id} className='friend-request'>
      <h3>{request.sender_name}</h3>
      <div className='friend-request-actions'>
        <a href='#' className='accept-button' onClick={() => acceptFriendRequest(request)}>Accept</a>
        <a href='#' className='decline-button' onClick={() => declineFriendRequest(request)}>Decline</a>
      </div>
    </div>
  )
})

const requesterInfo = async (request) => {
  const requester = await fetch(`/api/profiles/${request.sender_id}`)
  const data = await requester.json();
  return data;
}

  const reformatCreatedAt = (date) => {
    const dateObj = new Date(date);
    const month = dateObj.toLocaleString('default', { month: 'long' });
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();
    return `${month} ${day}, ${year}`;
  }

  const mappedFriends = friends.map((friend) => {
    console.log(friend)
    console.log(friend.self_profile_picture)
    console.log(friend.recipient_profile_picture)
    console.log(profile.id)
    console.log(friend.self_id)
    console.log(friend.self_id === profile.id ? true : false)
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
        <h2>{friend.sender_name === profile.name ? friend.recipient_name : friend.sender_name}</h2>
        <p>Friends since {reformatCreatedAt(friend.added_at)}</p>
      </div>
        <a href='#' onClick={() => deleteFriend(friend)}>Remove friend</a>
      </div>
    )
  })


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
    </div>
  );
}

export default FriendsList;