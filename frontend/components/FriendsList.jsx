import React, { useState, useEffect } from 'react';
import OtherUser from './OtherUser';

function FriendsList({ profile, allUsers, friends }) {
  const [newRequests, setNewRequests] = useState([]);
  const [tempFriends, setTempFriends] = useState([]);
  const [otherUserId, setOtherUserId] = useState(0);
  const [friendSearch, setFriendSearch] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    getFriendRequests();
  }, []);

  const reformatCreatedAt = (date) => {
    const dateObj = new Date(date);
    const month = dateObj.toLocaleString('default', { month: 'long' });
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();
    return `${month} ${day}, ${year}`;
  }

  const handleSearch = (e) => {
    if (friendSearch === '') {
      setFilteredUsers([]);
    }
    setFriendSearch(e.target.value.toLowerCase());
    const filteredUsers = allUsers.filter(user => {
      console.log(user)
      if (user.id === profile.id) {
        return false;
      }
      return user.name.toLowerCase().includes(friendSearch);
    });
    setFilteredUsers(filteredUsers);
  }

  const getFriendRequests = async () => {
    const incomingRequests = profile.received_friend_requests.filter(request => request.accepted === false);
    setNewRequests(incomingRequests);
  }

  const acceptFriendRequest = async (request) => {
    const acceptedAt = new Date().toISOString();

    const response = await fetch(`/api/friends/${request.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accepted: true,
        accepted_at: acceptedAt
      })
    });
    
    if (response.ok) {
      const newFriend = {
        id: request.id,
        sender_id: request.sender_id,
        receiver_id: request.receiver_id,
        sender_name: request.sender_name,
        receiver_name: request.receiver_name,
        sender_profile_picture: request.sender_profile_picture,
        receiver_profile_picture: request.receiver_profile_picture,
        added_at: request.added_at,
        accepted: true,
        accepted_at: acceptedAt
      };
      setTempFriends(tempFriends.length > 0 ? [...tempFriends, newFriend] : [...friends, newFriend])
      setNewRequests(prevRequests => prevRequests.filter(req => req.id !== request.id));
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
      setTempFriends(tempFriends.filter(f => f.id !== friend.id));
    } else {
      console.log('Error deleting friend');
    }
  }

  const mappedFriendRequests = newRequests.map((request) => {
    return (
      <div key={request.id} className='friend-request'>
        <h3 onClick={() => handleOpenOtherUser(request.sender_id === profile.id ? request.other_user_id : request.sender_id)}>{request.sender_name}</h3>
        <div className='friend-request-actions'>
          <a href='#' className='accept-button' onClick={() => acceptFriendRequest(request)}>Accept</a>
          <a href='#' className='decline-button' onClick={() => declineFriendRequest(request)}>Decline</a>
        </div>
      </div>
    )
  })

  const mappedFriends = (tempFriends.length > 0 ? tempFriends : friends).map((friend) => {
    return (
      <div key={friend.id} className='friend'>
      <img 
        src={
          ((friend.sender_id === profile.id) ? friend.receiver_profile_picture : friend.sender_profile_picture) 
          ? `data:image/jpeg;base64,${friend.sender_id === profile.id ? friend.receiver_profile_picture : friend.sender_profile_picture}` 
          : 'https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_640.png'
        } 
        alt='profile picture' 
        className='friend-profile-picture-friends-tab'
      />
      <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
        <h2 className='friend-name-header' onClick={() => handleOpenOtherUser(friend.sender_id === profile.id ? friend.other_user_id : friend.sender_id)}>{friend.sender_id === profile.id ? friend.receiver_name : friend.sender_name}</h2>
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

  const mappedFilteredUsers = filteredUsers.map(user => (
    <div key={user.id} className='friend-request'>
      <h3 onClick={() => handleOpenOtherUser(user.sender_id === profile.id ? user.receiver_id : user.sender_id)}>{user.sender_name}</h3>
      <div className='friend-request-actions'>
      <div key={friend.id} className="dropdown-item" onClick={() => startConversation(friendName, friend.id)}>
              <img src={`data:image/jpeg;base64,${friendPfp}`} alt="Profile" className="friend-profile-picture" />
              <span className="friend-name">{friendName}</span>
          </div>
      </div>
    </div>
  ));

  return (
    <div>
      <div className='friends-background'></div>
      <h1 className='friends-header' style={{paddingTop: '50px', textAlign: 'center'}}>Friends</h1>
      <div className='friends-container'>
        <div className='friend-search-input-container'>
          <label htmlFor="search" className="search-label">Search for other users here:</label>
            <input
            type="text"
            placeholder="Search for users..."
            value={friendSearch}
            onChange={handleSearch}
            className="search-bar-friends"
          />
        </div>
        {(filteredUsers.length > 0) &&
          <div className="user-dropdown">
            {mappedFilteredUsers}
          </div>
        }
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