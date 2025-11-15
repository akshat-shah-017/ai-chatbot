import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar/Sidebar';
import ChatContainer from '../components/Chat/ChatContainer';
import SettingsPanel from '../components/Settings/SettingsPanel';
import AnalyticsDashboard from '../components/Analytics/AnalyticsDashboard';
import Modal from '../components/Common/Modal';
import './MainLayout.css';

const MainLayout = () => {
  const { logout } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showExportImport, setShowExportImport] = useState(false);

  return (
    <div className="main-layout">
      <Sidebar
        onNavigateSettings={() => setShowSettings(true)}
        onNavigateAnalytics={() => setShowAnalytics(true)}
      />
      
      <div className="main-content">
        <div className="main-header">
          <button
            onClick={() => setShowExportImport(true)}
            className="header-button"
            title="Export/Import"
          >
            📥 Export/Import
          </button>
          <button onClick={logout} className="header-button logout-button">
            🚪 Logout
          </button>
        </div>
        
        <ChatContainer />
      </div>

      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Settings"
      >
        <SettingsPanel onClose={() => setShowSettings(false)} />
      </Modal>

      <Modal
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        title="Analytics"
      >
        <AnalyticsDashboard onClose={() => setShowAnalytics(false)} />
      </Modal>

      <Modal
        isOpen={showExportImport}
        onClose={() => setShowExportImport(false)}
        title="Export/Import Sessions"
      >
        <ExportImportPanel onClose={() => setShowExportImport(false)} />
      </Modal>
    </div>
  );
};

// Export/Import Panel Component
const ExportImportPanel = ({ onClose }) => {
  const { currentSession } = useSessionContext();
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);

  const handleExportJSON = async () => {
    if (!currentSession) {
      alert('Please select a session to export');
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/export/${currentSession._id}/json`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentSession.title}_export.json`;
      a.click();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export session');
    }
  };

  const handleExportMarkdown = async () => {
    if (!currentSession) {
      alert('Please select a session to export');
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/export/${currentSession._id}/markdown`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentSession.title}_export.md`;
      a.click();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export session');
    }
  };

  const handleImport = async () => {
    if (!importFile) return;

    try {
      setImporting(true);
      const text = await importFile.text();
      const sessionData = JSON.parse(text);

      await api.post('/export/import', { sessionData });
      alert('Session imported successfully');
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import session');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="export-import-panel">
      <div className="panel-section">
        <h3>Export Current Session</h3>
        <div className="button-group">
          <button onClick={handleExportJSON} className="export-button">
            📄 Export as JSON
          </button>
          <button onClick={handleExportMarkdown} className="export-button">
            📝 Export as Markdown
          </button>
        </div>
      </div>

      <div className="panel-section">
        <h3>Import Session</h3>
        <input
          type="file"
          accept=".json"
          onChange={(e) => setImportFile(e.target.files[0])}
          className="import-input"
        />
        <button
          onClick={handleImport}
          disabled={!importFile || importing}
          className="import-button"
        >
          {importing ? 'Importing...' : '📥 Import JSON'}
        </button>
      </div>
    </div>
  );
};

// Add missing import
import { useSessionContext } from '../contexts/SessionContext';
import api from '../services/api';

export default MainLayout;