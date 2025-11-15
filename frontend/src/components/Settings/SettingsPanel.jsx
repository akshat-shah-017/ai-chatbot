import { useState, useEffect } from 'react';
import api from '../../services/api';
import ModelSettings from './ModelSettings';
import './SettingsPanel.css';

const SettingsPanel = ({ onClose }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.get('/settings');
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (newSettings) => {
    try {
      setSaving(true);
      await api.put('/settings', newSettings);
      setSettings({ ...settings, ...newSettings });
      alert('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="settings-panel">Loading settings...</div>;
  }

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h2>Settings</h2>
        <button onClick={onClose} className="close-button">×</button>
      </div>

      <div className="settings-content">
        <ModelSettings
          settings={settings?.modelSettings}
          onSave={(modelSettings) => handleSave({ modelSettings })}
          saving={saving}
        />
      </div>
    </div>
  );
};

export default SettingsPanel;