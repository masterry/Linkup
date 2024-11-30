import React from 'react';
import { Route, Routes } from 'react-router-dom'; // Import Routes instead of Switch
import ChatHistory from '../../components/chathistory/chatHistory'; // Adjust path if necessary
import Messages from '../../components/messages/messages'; // Adjust path if necessary
import './chatApp.css'; // Optional: Create a CSS file for custom styles

const ChatApp = () => {
  return (
    <div className="chat-app-container">
      <div className="chat-sidebar">
        <ChatHistory /> {/* Display chat history in the sidebar */}
      </div>

      <div className="chat-main">
        <Routes> {/* Use Routes instead of Switch */}
          <Route path="/messages" element={<Messages />} /> {/* Display messages when a chat is selected */}
        </Routes>
      </div>
    </div>
  );
};

export default ChatApp;
