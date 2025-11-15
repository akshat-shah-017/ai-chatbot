import { createContext, useContext, useState, useEffect } from 'react';
import { sessionService } from '../services/sessionService';

const SessionContext = createContext();

export const useSessionContext = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSessionContext must be used within SessionProvider');
  }
  return context;
};

export const SessionProvider = ({ children }) => {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await sessionService.getSessions();
      setSessions(data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (title = 'New Chat') => {
    try {
      const newSession = await sessionService.createSession(title);
      setSessions(prev => [newSession, ...prev]);
      setCurrentSession(newSession);
      return newSession;
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  };

  const deleteSession = async (sessionId) => {
    try {
      await sessionService.deleteSession(sessionId);
      setSessions(prev => prev.filter(s => s._id !== sessionId));
      if (currentSession?._id === sessionId) {
        setCurrentSession(null);
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
      throw error;
    }
  };

  const renameSession = async (sessionId, title) => {
    try {
      const updated = await sessionService.updateSession(sessionId, title);
      setSessions(prev =>
        prev.map(s => (s._id === sessionId ? updated : s))
      );
      if (currentSession?._id === sessionId) {
        setCurrentSession(updated);
      }
    } catch (error) {
      console.error('Failed to rename session:', error);
      throw error;
    }
  };

  const selectSession = (session) => {
    setCurrentSession(session);
  };

  const value = {
    sessions,
    currentSession,
    loading,
    createSession,
    deleteSession,
    renameSession,
    selectSession,
    refreshSessions: loadSessions
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};
