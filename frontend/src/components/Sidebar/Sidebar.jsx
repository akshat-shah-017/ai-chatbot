import { useState } from 'react';
import { useSessionContext } from '../../contexts/SessionContext';
import SessionList from './SessionList';
import NewSessionButton from './NewSessionButton';
import ThemeToggle from '../Common/ThemeToggle';
import './Sidebar.css';

const Sidebar = ({ onNavigateAnalytics, onNavigateSettings }) => {
  const { createSession } = useSessionContext();
  const [collapsed, setCollapsed] = useState(false);

  const handleNewSession = async () => {
    await createSession('New Chat');
  };

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="sidebar-toggle"
        >
          {collapsed ? '→' : '←'}
        </button>
        
        {!collapsed && <h1>AI Chat</h1>}
      </div>

      {!collapsed && (
        <>
          <NewSessionButton onClick={handleNewSession} />
          <SessionList />
          
          <div className="sidebar-footer">
            <button onClick={onNavigateAnalytics} className="sidebar-nav-btn">
              📊 Analytics
            </button>
            <button onClick={onNavigateSettings} className="sidebar-nav-btn">
              ⚙️ Settings
            </button>
            <ThemeToggle />
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;
