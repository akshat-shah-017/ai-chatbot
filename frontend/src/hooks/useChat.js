import { useState, useCallback, useRef } from 'react';
import { chatService } from '../services/chatService';

export const useChat = (sessionId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState(null);
  const streamingMessageIdRef = useRef(null);

  const loadMessages = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      setLoading(true);
      const data = await chatService.getMessages(sessionId);
      setMessages(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const sendMessage = async (content, fileIds = []) => {
    if (!sessionId) return;

    try {
      setError(null);
      const { userMessage, assistantMessage } = await chatService.sendMessage(
        sessionId,
        content,
        fileIds
      );
      
      setMessages(prev => [...prev, userMessage, assistantMessage]);
      return assistantMessage;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const streamMessage = async (content, fileIds = [], onChunk) => {
  if (!sessionId) return;

  try {
    setStreaming(true);
    setError(null);

    // Generate temporary IDs
    const tempUserId = 'temp-user-' + Date.now();
    const tempAssistantId = 'temp-assistant-' + Date.now();

    // Add user message immediately
    const tempUserMsg = {
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
      _id: tempUserId
    };
    
    // Add placeholder for assistant message
    const tempAssistantMsg = {
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
      _id: tempAssistantId
    };
    
    setMessages(prev => [...prev, tempUserMsg, tempAssistantMsg]);

    let fullContent = '';

    // Stream the response
    await chatService.streamMessage(
      sessionId,
      content,
      fileIds,
      (chunk) => {
        fullContent += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg.role === 'assistant') {
            lastMsg.content = fullContent;
          }
          return newMessages;
        });
        
        if (onChunk) onChunk(chunk);
      }
    );

    // Don't reload - streaming is complete and message is saved on backend
    // Just update IDs will be temp but that's okay for display
    
  } catch (err) {
    setError(err.message);
    // Remove temporary messages on error
    setMessages(prev => prev.filter(msg => !msg._id.startsWith('temp-')));
    throw err;
  } finally {
    setStreaming(false);
  }
};

  const regenerateResponse = async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      setError(null);

      // Remove last assistant message
      setMessages(prev => {
        const filtered = [...prev];
        for (let i = filtered.length - 1; i >= 0; i--) {
          if (filtered[i].role === 'assistant') {
            filtered.splice(i, 1);
            break;
          }
        }
        return filtered;
      });

      const newMessage = await chatService.regenerateResponse(sessionId);
      setMessages(prev => [...prev, newMessage]);
      
      return newMessage;
    } catch (err) {
      setError(err.message);
      // Reload messages to get back to consistent state
      await loadMessages();
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const editMessage = async (messageId, newContent) => {
    try {
      setError(null);
      const updated = await chatService.editMessage(messageId, newContent);
      setMessages(prev =>
        prev.map(msg => (msg._id === messageId ? updated : msg))
      );
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      setError(null);
      await chatService.deleteMessage(messageId);
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    messages,
    loading,
    streaming,
    error,
    loadMessages,
    sendMessage,
    streamMessage,
    regenerateResponse,
    editMessage,
    deleteMessage
  };
};