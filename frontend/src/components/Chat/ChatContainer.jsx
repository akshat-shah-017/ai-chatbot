import { useEffect } from 'react';
import { useSessionContext } from '../../contexts/SessionContext';
import { useChat } from '../../hooks/useChat';
import MessageList from './MessageList';
import InputArea from './InputArea';
import TypingIndicator from './TypingIndicator';
import './ChatContainer.css';

const ChatContainer = () => {
  const { currentSession } = useSessionContext();
  const {
    messages,
    loading,
    streaming,
    error,
    loadMessages,
    streamMessage,
    regenerateResponse,
    editMessage,
    deleteMessage
  } = useChat(currentSession?._id);

  useEffect(() => {
    if (currentSession) {
      loadMessages();
    }
  }, [currentSession, loadMessages]);

  if (!currentSession) {
    return (
      <div className="chat-container-empty">
        <div className="empty-state">
          <h2>Welcome to AI Chat</h2>
          <p>Select a conversation or start a new one</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>{currentSession.title}</h2>
      </div>

      <MessageList
        messages={messages}
        loading={loading}
        onEdit={editMessage}
        onDelete={deleteMessage}
        onRegenerate={regenerateResponse}
      />

      {streaming && <TypingIndicator />}
      
      {error && (
        <div className="chat-error">
          <span>{error}</span>
        </div>
      )}

      <InputArea
        onSend={streamMessage}
        disabled={streaming || loading}
        sessionId={currentSession._id}
      />
    </div>
  );
};

export default ChatContainer;
