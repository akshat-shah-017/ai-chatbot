import { useState } from 'react';
import './MessageActions.css';

const MessageActions = ({ message, onEdit, onDelete, onRegenerate }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="message-actions">
      {message.role === 'assistant' && (
        <>
          <button
            onClick={handleCopy}
            className="action-btn"
            title="Copy to clipboard"
          >
            {copied ? '✓ Copied' : '📋 Copy'}
          </button>
          
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="action-btn"
              title="Regenerate response"
            >
              🔄 Regenerate
            </button>
          )}
        </>
      )}
      
      {message.role === 'user' && (
        <button
          onClick={onEdit}
          className="action-btn"
          title="Edit message"
        >
          ✏️ Edit
        </button>
      )}
      
      <button
        onClick={onDelete}
        className="action-btn action-btn-danger"
        title="Delete message"
      >
        🗑️ Delete
      </button>
    </div>
  );
};

export default MessageActions;
