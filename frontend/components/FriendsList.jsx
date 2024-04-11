import React, { useState, useEffect } from 'react';

function FriendsList({ profile }) {
  const [newRequests, setNewRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  
  useEffect(() => {
    getFriendRequests();
    getFriends();
  }, []);

  console.log(profile)

  const getFriendRequests = async () => {
    const response = await fetch('/api/friends');
    const data = await response.json();
    let requests = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i].friend_id === profile.id && data[i].accepted === false) {
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
      if (data[i].profile_id === profile.id || data[i].friend_id === profile.id && data[i].accepted === true) {        
        friends.push(data[i]);
      }
    }
    setFriends(friends);
    getFriendRequests();
  }

  const mappedFriendRequests = newRequests.map((request) => {
    return (
      <div key={request.id}>
        <h3>{request.name}</h3>
        <button>Accept</button>
      </div>
    )
  })

  return (
    <div>
      <div className='friends-background'></div>
      <div className='friends-container'>
        {newRequests ? 
        <div className="friend-requests">
          {mappedFriendRequests}
        </div>
        :
        null
        }
        <div>
            <h1>Friends</h1>
        </div>
      </div>
    </div>
  );
}

export default FriendsList;