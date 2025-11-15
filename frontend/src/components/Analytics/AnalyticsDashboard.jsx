import { useState, useEffect } from 'react';
import api from '../../services/api';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = ({ onClose }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await api.get('/analytics');
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="analytics-dashboard">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="analytics-dashboard">No data available</div>;
  }

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h2>📊 Usage Analytics</h2>
        <button onClick={onClose} className="close-button">×</button>
      </div>

      <div className="analytics-content">
        <div className="analytics-grid">
          <div className="analytics-card">
            <div className="card-icon">💬</div>
            <div className="card-content">
              <div className="card-value">{analytics.totalMessages}</div>
              <div className="card-label">Total Messages</div>
            </div>
          </div>

          <div className="analytics-card">
            <div className="card-icon">📁</div>
            <div className="card-content">
              <div className="card-value">{analytics.totalSessions}</div>
              <div className="card-label">Sessions</div>
            </div>
          </div>

          <div className="analytics-card">
            <div className="card-icon">📊</div>
            <div className="card-content">
              <div className="card-value">{analytics.avgMessagesPerSession}</div>
              <div className="card-label">Avg. Messages/Session</div>
            </div>
          </div>

          <div className="analytics-card">
            <div className="card-icon">👤</div>
            <div className="card-content">
              <div className="card-value">{analytics.userMessages}</div>
              <div className="card-label">Your Messages</div>
            </div>
          </div>
        </div>

        <div className="analytics-section">
          <h3>Most Active Sessions</h3>
          <div className="top-sessions">
            {analytics.topSessions?.map(session => (
              <div key={session._id} className="session-stat">
                <div className="session-stat-title">{session.title}</div>
                <div className="session-stat-count">{session.messageCount} messages</div>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-section">
          <h3>Activity (Last 7 Days)</h3>
          <div className="activity-chart">
            {analytics.messagesByDay?.map(day => (
              <div key={day._id} className="activity-bar-container">
                <div className="activity-date">{day._id}</div>
                <div className="activity-bar-wrapper">
                  <div
                    className="activity-bar"
                    style={{
                      width: `${(day.count / Math.max(...analytics.messagesByDay.map(d => d.count))) * 100}%`
                    }}
                  />
                  <span className="activity-count">{day.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;