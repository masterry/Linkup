import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './chatHistory.css';

const ChatHistory = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState('');
  const [error, setError] = useState(null);

  const navigate = useNavigate();  // Use useNavigate instead of useHistory
  const location = useLocation();  // Use useLocation to access the state passed via the route

  const userId = location.state?.user_id;  // Get user_id from the location state

  // Fetch list of conversations
  useEffect(() => {
    if (!userId) return;  // Exit if user_id is not available

    const fetchConversations = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/get_user_chat_history/${userId}`); // API to fetch conversations with user_id
        setConversations(response.data);
      } catch (error) {
        console.error("Error fetching conversations:", error);
        setError(error.message);
      }
    };

    fetchConversations();
  }, [userId]);

  // Fetch messages when a conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      const { sender, recipient } = selectedConversation;

      const fetchMessages = async () => {
        try {
          const response = await axios.get('http://127.0.0.1:5000/get_messages', {
            params: { sender, recipient },
          });
          setMessages(response.data);
        } catch (error) {
          console.error("Error fetching messages:", error);
          setError(error.message);
        }
      };

      fetchMessages();
    }
  }, [selectedConversation]);

  const handleSendMessage = async () => {
    if (!messageContent.trim()) return;

    const payload = {
      sender: selectedConversation.sender,
      recipient: selectedConversation.recipient,
      content: messageContent,
    };

    try {
      await axios.post('http://127.0.0.1:5000/send_message', payload);
      setMessageContent('');
      const response = await axios.get('http://127.0.0.1:5000/get_messages', {
        params: { sender: selectedConversation.sender, recipient: selectedConversation.recipient },
      });
      setMessages(response.data);
    } catch (error) {
      console.error("Error sending message:", error);
      setError(error.message);
    }
  };

  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation);
    navigate(`?sender=${conversation.sender}&recipient=${conversation.recipient}`);  // Use navigate instead of history.push
  };

  return (
    <div className="messages-container">
      <header className="messages-header">
        <h2>Chat History</h2>
      </header>

      {/* Conversation List */}
      <main className="conversations-list">
        {error && <p className="error-message">Error: {error}</p>}
        {conversations.length === 0 && <p>No conversations available.</p>}
        <ul>
          {conversations.map((conversation, index) => (
            <li key={index} onClick={() => handleConversationClick(conversation)} className="conversation-item">
              <span>{conversation.recipient}</span>
            </li>
          ))}
        </ul>
      </main>

      {/* Chat History of selected conversation */}
      {selectedConversation && (
        <>
          <header className="messages-header">
            <h2>Chat with {selectedConversation.recipient}</h2>
          </header>
          <main className="messages-content">
            {messages.length === 0 && <p>No messages yet. Start the conversation!</p>}
            <div className="messages-list">
              {messages.map((message, index) => (
                <div key={index} className={`message ${message.sender === selectedConversation.sender ? 'sent' : 'received'}`}>
                  <p>{message.content}</p>
                </div>
              ))}
            </div>
          </main>
          <footer className="messages-footer">
            <input
              type="text"
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Type a message..."
            />
            <button onClick={handleSendMessage}>Send</button>
          </footer>
        </>
      )}
    </div>
  );
};

export default ChatHistory;
