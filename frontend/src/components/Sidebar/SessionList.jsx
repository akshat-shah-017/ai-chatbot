import { useSessionContext } from '../../contexts/SessionContext';
import SessionItem from './SessionItem';
import './SessionList.css';

const SessionList = () => {
  const { sessions, loading } = useSessionContext();

  if (loading) {
    return <div className="session-list-loading">Loading sessions...</div>;
  }

  if (sessions.length === 0) {
    return (
      <div className="session-list-empty">
        <p>No conversations yet</p>
      </div>
    );
  }

  return (
    <div className="session-list">
      {sessions.map(session => (
        <SessionItem key={session._id} session={session} />
      ))}
    </div>
  );
};

export default SessionList;
