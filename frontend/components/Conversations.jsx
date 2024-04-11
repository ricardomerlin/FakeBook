import React, { useState, useEffect }  from "react";
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';

function Conversations({ profile }) {

  const [conversations, setConversations] = useState([]);

  const getConvos = async () => {
    const response = await fetch('/api/conversations');
    const data = await response.json();
    setConversations(data);
  }

  const userConversations = conversations.filter(conversation => conversation.user_id === profile.id);

  return (
    <div>
      <div className="conversations-background"></div>
      <div className="conversations-container">
        <h1>PLEASE WORK</h1>
      </div>
    </div>
  );
}

export default Conversations;