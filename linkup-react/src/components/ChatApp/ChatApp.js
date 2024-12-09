// src/components/ChatPage/ChatPage.js
import React, { useState } from 'react';
import ChatHistory from '../chathistory/chatHistory';
import Messages from '../messages/messages';
import './chatPage.css';

const ChatApp = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);

  const handleSelectConversation = (sender, recipient) => {
    setSelectedConversation({ sender, recipient });
  };

  return (
    <div className="chat-app-container">
      <div className="chat-app-content">
        <div className="left-panel">
          <ChatHistory onChatClick={handleSelectConversation} />
        </div>
        <div className="right-panel">
          {selectedConversation ? (
            <Messages
              sender={selectedConversation.sender}
              recipient={selectedConversation.recipient}
            />
          ) : (
            <div className="empty-chat">Select a conversation to view messages</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatApp;