import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import TypingIndicator from '../components/TypingIndicator';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // --- Clear previous chat on login
  React.useEffect(() => {
    const clearSession = async () => {
      try {
        const token = localStorage.getItem('token');
        await axios.delete('http://localhost:5001/api/chat/session', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages([]); // ensure frontend starts fresh
      } catch (err) {
        console.error('Failed to clear previous session:', err);
      }
    };
    clearSession();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setLoading(true);
    setIsTyping(true);

    const tempUserMessage = {
      id: Date.now(),
      message: userMessage,
      sender: 'user',
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5001/api/chat',
        { message: userMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setMessages((prev) => {
          const filtered = prev.filter((msg) => msg.id !== tempUserMessage.id);
          const combined = [
            ...filtered,
            response.data.userMessage,
            response.data.botMessage,
          ];
          return combined.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        });
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage = {
        id: Date.now() + 1,
        message: '⚠️ Sorry, there was an error processing your message. Please try again.',
        sender: 'bot',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>🤖 AI Chatbot</h2>
        <div className="user-info">
          <span className="user-name">Hello, {user.name}!</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'white', marginTop: '50px', fontSize: '18px', opacity: 0.7 }}>
            👋 Start a conversation with the AI!
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg._id || msg.id} className={`message ${msg.sender}`}>
              <div className="message-bubble">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" {...props}>
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code {...props} className="inline-code" style={{ background: 'rgba(0,0,0,0.2)', padding: '2px 5px', borderRadius: '4px', fontSize: '0.95em' }}>
                          {children}
                        </code>
                      );
                    },
                    table({ children }) {
                      return <div className="table-container"><table className="markdown-table">{children}</table></div>;
                    },
                  }}
                >
                  {msg.message}
                </ReactMarkdown>
                <div className="message-time">{formatTime(msg.createdAt)}</div>
              </div>
            </div>
          ))
        )}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <form onSubmit={handleSubmit} className="chat-input-form">
          <input
            type="text"
            className="chat-input"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="btn-send" disabled={loading || !inputMessage.trim()}>
            {loading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
