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
        <a href='#' onClick={() => acceptFriendRequest(request)}>Accept</a>
        <a href='#' onClick={() => declineFriendRequest(request)}>Decline</a>
      </div>
    )
  })

  const mappedFriends = friends.map((friend) => {
    return (
      <div key={friend.id} className='friend'>
        <h3>{friend.sender_name === profile.name ? friend.recipient_name : friend.sender_name}</h3>
        <a href='#' onClick={() => deleteFriend(friend)}>Remove friend</a>
      </div>
    )
  })


  return (
    <div>
      <div className='friends-background'></div>
      <div className='friends-container'>
        {(newRequests.length > 0) ? 
        <div className="friend-requests-container">New requests
          {mappedFriendRequests}
        </div>
        :
        null
        }
        <h1>Friends</h1>
        <div className='friends-list'>
          {mappedFriends}
        </div>
      </div>
    </div>
  );
}

export default FriendsList;