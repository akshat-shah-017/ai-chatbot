import { useState } from 'react';
import { useSessionContext } from '../../contexts/SessionContext';
import './SessionItem.css';

const SessionItem = ({ session }) => {
  const { currentSession, selectSession, renameSession, deleteSession } = useSessionContext();
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(session.title);
  const [showActions, setShowActions] = useState(false);

  const isActive = currentSession?._id === session._id;

  const handleClick = () => {
    if (!isEditing) {
      selectSession(session);
    }
  };

  const handleRename = async () => {
    if (newTitle.trim() && newTitle !== session.title) {
      await renameSession(session._id, newTitle);
    }
    setIsEditing(false);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm('Delete this conversation?')) {
      await deleteSession(session._id);
    }
  };

  return (
    <div
      className={`session-item ${isActive ? 'active' : ''}`}
      onClick={handleClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {isEditing ? (
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onBlur={handleRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRename();
            if (e.key === 'Escape') setIsEditing(false);
          }}
          className="session-item-input"
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <>
          <div className="session-item-content">
            <div className="session-item-title">{session.title}</div>
            {session.lastMessage && (
              <div className="session-item-preview">
                {session.lastMessage.substring(0, 50)}...
              </div>
            )}
            <div className="session-item-meta">
              {session.messageCount} messages
            </div>
          </div>
          
          {showActions && (
            <div className="session-item-actions">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="session-action-btn"
                title="Rename"
              >
                ✏️
              </button>
              <button
                onClick={handleDelete}
                className="session-action-btn session-action-delete"
                title="Delete"
              >
                🗑️
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SessionItem;
