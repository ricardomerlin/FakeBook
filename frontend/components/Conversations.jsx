import React, { useState, useEffect, useRef } from "react";
import { Link } from 'react-router-dom';
import Modal from 'react-modal';

Modal.setAppElement('#root');

function Conversations({ profile, allMessages, fetchAllMessages }) {
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
  const [lastMessages, setLastMessages] = useState({});

  useEffect(() => {
    getConvos();
  }, []);

  useEffect(() => {
    if (searchedFriend && searchedFriend.length > 0) {
      filterFriends();
    } else {
      setFilteredFriends([]);
    }
  }, [searchedFriend]);

  useEffect(() => {
    if (selectedConversation && allMessages) {
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
  
    const lastMessages = {};
    for (let convo of data) {
      const response = await fetch(`/api/conversations/${convo.id}/last_message`);
      const messageData = await response.json();
      lastMessages[convo.id] = messageData;
    }
    setLastMessages(lastMessages);
  }

  const getAllMessagesFromApp = async () => {
    fetchAllMessages();
  }

  const filterFriends = () => {
    const searchResults = friends.filter(friend => {
      if (friend.accepted === false) return false;
      const lowerCaseSearchedFriend = searchedFriend.toLowerCase();
  
      const existingConversation = conversations.find(conversation => {
        return (
          (conversation.self_id === profile.id && conversation.other_user_id === friend.id) ||
          (conversation.self_id === friend.id && conversation.other_user_id === profile.id)
        );
      });
  
      if (existingConversation) return false;
  
      return (
        friend.sender_name.toLowerCase().includes(lowerCaseSearchedFriend) ||
        friend.recipient_name.toLowerCase().includes(lowerCaseSearchedFriend)
      );
    });
  
    setFilteredFriends(searchResults);
  }
  

  const filterMessages = (conversationId) => {
    const messages = allMessages.filter(message => message.conversation_id === conversationId);
    setUserMessages(messages);
  }

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
    const friend = friends.find(friend => friend.id === friendId);
    const user2_profile_picture = friend.self_id == profile.id ? friend.recipient_profile_picture : friend.self_profile_picture;
  
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
          user2_name: friendName,
          user1_profile_picture: profile.profile_picture,
          user2_profile_picture: user2_profile_picture
        }),
      });
      if (response.ok) {
        getConvos();
        getAllMessagesFromApp();
        openModal();
        setSelectedConversation(response.data);
        setSearchedFriend(null);
        setInitiatingConvo(false);
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
      getConvos();
      // getMessages(selectedConversation.id);
      setMessageInput("");
      getAllMessagesFromApp();
      filterMessages(selectedConversation.id);
    } else {
      console.error('Failed to send message');
    }
  }

  const userConversations = conversations.filter(conversation => conversation.self_id === profile.id || conversation.other_user_id === profile.id);

  return (
    <div>
      <div className="conversations-background"></div>
      <h1 className="conversations-header" style={{paddingTop: '50px', textAlign: 'center'}}>Messages</h1>
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
              <button style={{padding: '5px', borderRadius: '5px'}} onClick={() => {
                setInitiatingConvo(false);
                setSearchedFriend(null);
              }}>Cancel</button>
              {filteredFriends.length > 0 && (
                <div className="dropdown">
                  {filteredFriends.map((friend, index) => {
                    const friendName = friend.sender_name.toLowerCase() === profile.name.toLowerCase() ? friend.recipient_name : friend.sender_name;
                    const friendPfp = friend.sender_name.toLowerCase() === profile.name.toLowerCase() ? friend.recipient_profile_picture : friend.self_profile_picture;
                    return (
                      <div key={friend.id} className="dropdown-item" onClick={() => startConversation(friendName, friend.id)}>
                        <img src={`data:image/jpeg;base64,${friendPfp}`} alt="Profile" className="friend-profile-picture" />
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
          {userConversations.length === 0 ? (
            <div className="no-conversations">
              <p>No conversations yet. Start a new one!</p>
            </div>
          ) : (
            userConversations.map((conversation, index) => {
              const otherUser = conversation.self_id === profile.id ? conversation.other_user_name : conversation.self_name;
              return (
                <div key={conversation.id} className="conversation-item" onClick={() => openConversationModal(conversation)}>
                  <img src={conversation.self_id === profile.id ? `data:image/jpeg;base64,${conversation.other_user_profile_picture}` : `data:image/jpeg;base64,${conversation.self_profile_picture}`} alt="Profile" className="conversation-profile-pic" />
                  <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '50%'}}>
                    <h3 style={{marginBottom: '0', fontSize: '14px'}}>{otherUser}</h3>
                    <p style={{marginTop: '8px', fontSize: '10px'}}>
                    {lastMessages[conversation.id]?.last_message ? 
                    <>
                        <strong>
                            {lastMessages[conversation.id].last_message.sender_id === profile.id ? 'You' : conversation.other_user_name}
                        </strong>
                        {': '}
                        {lastMessages[conversation.id].last_message.content}
                    </>
                    : 'No messages'}
                    </p>
                  </div>
                  <p>
                  {lastMessages[conversation.id]?.last_message ? 
                    new Date(lastMessages[conversation.id].last_message.created_at).toLocaleString('en-US', {
                      month: 'long', 
                      day: 'numeric', 
                      hour: 'numeric', 
                      minute: 'numeric'
                    }) 
                    : 'No messages'}
                </p>
                </div>
              );
            })
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
