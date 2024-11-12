import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './messages.css';

const Messages = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const sender = query.get('sender');
  const recipient = query.get('recipient');

  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
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
  }, [sender, recipient]);

  const handleSendMessage = async () => {
    if (!messageContent.trim()) return;

    const payload = {
      sender,
      recipient,
      content: messageContent,
    };

    try {
      await axios.post('http://127.0.0.1:5000/send_message', payload);
      setMessageContent('');
      const response = await axios.get('http://127.0.0.1:5000/get_messages', {
        params: { sender, recipient },
      });
      setMessages(response.data);
    } catch (error) {
      console.error("Error sending message:", error);
      setError(error.message);
    }
  };

  return (
    <div className="messages-container">
      <header className="messages-header">
        <h2>Chat with {recipient}</h2>
      </header>
      <main className="messages-content">
        {error && <p className="error-message">Error: {error}</p>}
        {messages.length === 0 && <p>No messages yet. Start the conversation!</p>}
        <div className="messages-list">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.sender === parseInt(sender) ? 'sent' : 'received'}`}
            >
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
    </div>
  );
};

export default Messages;
