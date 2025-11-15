import { useState } from 'react';
import MessageActions from './MessageActions';
import MarkdownRenderer from '../Common/MarkdownRenderer';
import './MessageItem.css';

const MessageItem = ({ message, onEdit, onDelete, onRegenerate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const handleSaveEdit = async () => {
    if (editContent.trim() && editContent !== message.content) {
      await onEdit(message._id, editContent);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  return (
    <div className={`message-item ${message.role}`}>
      <div className="message-avatar">
        {message.role === 'user' ? '👤' : '🤖'}
      </div>
      
      <div className="message-content-wrapper">
        {isEditing ? (
          <div className="message-edit">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="message-edit-input"
              rows={4}
            />
            <div className="message-edit-actions">
              <button onClick={handleSaveEdit} className="btn-save">
                Save
              </button>
              <button onClick={handleCancelEdit} className="btn-cancel">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="message-content">
              <MarkdownRenderer content={message.content} />
            </div>
            
            <MessageActions
              message={message}
              onEdit={() => setIsEditing(true)}
              onDelete={() => onDelete(message._id)}
              onRegenerate={onRegenerate}
            />
          </>
        )}
        
        {message.metadata?.isEdited && (
          <span className="message-edited-label">(edited)</span>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
