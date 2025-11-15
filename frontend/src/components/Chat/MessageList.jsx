import { useRef, useEffect } from 'react';
import MessageItem from './MessageItem';
import './MessageList.css';

const MessageList = ({ messages, loading, onEdit, onDelete, onRegenerate }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading && messages.length === 0) {
    return (
      <div className="message-list">
        <div className="loading-state">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages.map((message, index) => (
        <MessageItem
          key={message._id || index}
          message={message}
          onEdit={onEdit}
          onDelete={onDelete}
          onRegenerate={index === messages.length - 1 ? onRegenerate : null}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;