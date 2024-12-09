import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './chatHistory.css';

const ChatHistory = ({ onChatClick }) => {
  const { userID } = useParams(); // Extract userID from URL
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/get_user_chat_history/${userID}`);
        const data = await response.json();
        setChatHistory(data);
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };

    fetchChatHistory();
  }, [userID]);

  return (
    <div className="chat-history-container">
      <h2>Chat History</h2>
      <div className="chat-history">
        {chatHistory.length === 0 ? (
          <p>No conversations yet</p>
        ) : (
          chatHistory.map((chat, index) => (
            <div
              key={index}
              className="chat-item"
              onClick={() => onChatClick(userID, chat.user_id)}
            >
              <div className="chat-info">
                <p className="chat-user-name">{chat.user_name}</p>
                <p className="last-message">{chat.last_message}</p>
              </div>
              <p className="chat-timestamp">{new Date(chat.timestamp).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatHistory;
