import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './initiateChat.css';

const InitiateChat = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const sender = query.get('sender');
  const recipient = query.get('recipient');

  const [messages, setMessages] = useState([]);
  const [recipientName, setRecipientName] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Check if recipient name is available in state
    if (location.state && location.state.recipient_name) {
      setRecipientName(location.state.recipient_name);
    }

    const fetchMessages = async () => {
      try {
        const response = await axios.get('https://linkup-dating-2e181815b60e.herokuapp.com/get_messages', {
          params: { sender, recipient },
        });
        setMessages(response.data);
        
        // If no recipient name from state, fallback to the first message's recipient_name
        if (!location.state?.recipient_name && response.data.length > 0) {
          const message = response.data[0];
          setRecipientName(message.recipient === recipient ? message.recipient_name : message.sender_name);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        setError(error.message);
      }
    };

    fetchMessages();
  }, [sender, recipient, location.state]);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="messages-container">
      <header className="messages-header">
        <h2>Chat with {recipientName || recipient}</h2> {/* Display recipient_name or fallback to recipient */}
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
        <div ref={messagesEndRef} />
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

export default InitiateChat;
