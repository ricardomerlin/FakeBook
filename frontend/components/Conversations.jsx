import React, { useState, useEffect, useRef } from "react";
import { Link } from 'react-router-dom';
import Modal from 'react-modal';

Modal.setAppElement('#root');

function Conversations({ profile }) {
  const [conversations, setConversations] = useState([]);
  const [initiatingConvo, setInitiatingConvo] = useState(false);
  const [searchedFriend, setSearchedFriend] = useState(null);
  const [friends, setFriends] = useState([]);
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [userMessages, setUserMessages] = useState([]);
  const [otherUserProfile, setOtherUserProfile] = useState(null);
  const [allMessages, setAllMessages] = useState([]);

  useEffect(() => {
    getConvos();
    getFriends();
    getMessages();
  }, []);

  useEffect(() => {
    if (searchedFriend && searchedFriend.length > 0) {
      filterFriends();
    } else {
      setFilteredFriends([]);
    }
  }, [searchedFriend]);

  useEffect(() => {
    if (selectedConversation) {
      filterMessages(selectedConversation.id);
    }
  }, [selectedConversation, allMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [userMessages]);

  const getConvos = async () => {
    const response = await fetch('/api/conversations');
    const data = await response.json();
    setConversations(data);
  }

  const getMessages = async () => {
    const response = await fetch('/api/messages');
    const data = await response.json();
    setAllMessages(data);
  }

  const getFriends = async () => {
    const response = await fetch('/api/friends');
    const data = await response.json();
    setFriends(data);
  }

  const filterFriends = () => {
    const searchResults = friends.filter(friend => {
      if (friend.accepted === false) return false;
      return friend.sender_name.toLowerCase() == profile.name 
        ? friend.recipient_name.toLowerCase().includes(searchedFriend.toLowerCase()) 
        : friend.sender_name.toLowerCase().includes(searchedFriend.toLowerCase())
    });
    setFilteredFriends(searchResults);
  }

  const filterMessages = (conversationId) => {
    const messages = allMessages.filter(message => message.conversation_id === conversationId);
    setUserMessages(messages);
  }

  console.log(userMessages)

  const newMessage = () => {
    setInitiatingConvo(true);
  }

  const openModal = () => {
    setModalIsOpen(true);
  }

  const closeModal = () => {
    setModalIsOpen(false);
  }

  const startConversation = (friendName, friendId) => {
    const postConversation = async () => {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user1_id: profile.id,
          user2_id: friendId,
          user1_name: profile.name,
          user2_name: friendName
        }),
      });
      if (response.ok) {
        console.log('Conversation started');
        getMessages();
        closeModal();
      } else {
        console.error('Failed to start conversation');
      }
    }
    postConversation();
  }


  const openConversationModal = async (conversation) => {
    const otherUserId = conversation.self_id === profile.id ? conversation.other_user_id : conversation.self_id;
    const response = await fetch(`/api/profiles/${otherUserId}`);
    const otherUserProfile = await response.json();
    setOtherUserProfile(otherUserProfile);
    setSelectedConversation(conversation);
    openModal();
  }
  
  console.log(otherUserProfile)

  const closeConversationModal = () => {
    setSelectedConversation(null);
    closeModal();
  }

  const formatMessageTime = (timestamp) => {   
    const date = new Date(timestamp);
    
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${hours}:${minutes}`;
  }

  const formatMessageDate = (timestamp) => {
    const date = new Date(timestamp);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const sendMessage = async () => {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender_id: profile.id,
        receiver_id: selectedConversation.other_user_id,
        conversation_id: selectedConversation.id,
        content: messageInput
      }),
    });
    if (response.ok) {
      getMessages(selectedConversation.id);
      setMessageInput("");
    } else {
      console.error('Failed to send message');
    }
  }

  const userConversations = conversations.filter(conversation => conversation.self_id === profile.id || conversation.other_user_id === profile.id);

  return (
    <div>
      <div className="conversations-background"></div>
      <div className="conversations-page">
      <div className="new-message-container">
        <button onClick={newMessage} className="new-message-button">New message</button>
        {initiatingConvo && (
          <div className="initiating-message">
            <input
              type='text'
              onChange={(e) => {
                setSearchedFriend(e.target.value);
                if (e.target.value === '') {
                  setSearchedFriend(null);
                }
              }}
              placeholder="Search for a friend..."
              className="search-input"
            />
            <button onClick={() => {
              setInitiatingConvo(false);
              setSearchedFriend(null);
            }}>Cancel</button>
            {filteredFriends.length > 0 && (
              <div className="dropdown">
                {filteredFriends.map((friend, index) => {
                  const friendName = friend.sender_name.toLowerCase() === profile.name.toLowerCase() ? friend.recipient_name : friend.sender_name;
                  return (
                    <div key={friend.id} className="dropdown-item" onClick={() => startConversation(friendName, friend.id)}>
                      <img src={`data:image/jpeg;base64,${friend.profile_picture}`} alt="Profile" className="friend-profile-picture" />
                      <span className="friend-name">{friendName}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
        <div className="conversations-list">
          {userConversations.map((conversation, index) => {
            const otherUser = conversation.self_id === profile.id ? conversation.other_user_name : conversation.self_name;
            return (
              <div key={conversation.id} className="conversation-item" onClick={() => openConversationModal(conversation)}>
                <h3>{otherUser}</h3>
                <p>{conversation.last_message}</p>
              </div>
            );
          }
          )}
        </div>
        <Modal
          appElement={document.getElementById('root')}
          isOpen={modalIsOpen}
          onRequestClose={closeConversationModal}
          className="conversation-modal"
          overlayClassName="conversation-modal-overlay"
        >
          <div className="chat-area">
            {selectedConversation && userMessages.map((message, index) => (
              <div key={index} className={message.sender_id === profile.id ? "your-message" : "other-message"}>
                <img 
                  src={message.sender_id === profile.id 
                    ? `data:image/jpeg;base64,${profile.profile_picture}` 
                    : `data:image/jpeg;base64,${otherUserProfile.profile_picture}`} 
                  alt="Profile" 
                  className={`message-profile-picture ${message.sender_id === profile.id ? 'your-message-profile' : 'other-message-profile'}`}
                />
                <p className="message-content" style={{fontSize: '15px', marginTop: '5px', marginBottom: '5px'}}>{message.content}</p>
                <span className="message-time">Sent by {message.sender_id === profile.id ? "you" : otherUserProfile.name} at {formatMessageTime(message.created_at)} on {formatMessageDate(message.created_at)}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="message-input-container">
            <textarea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type your message..."
              className="message-input"
            />
            <button onClick={sendMessage} className="send-button">Send</button>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default Conversations;
