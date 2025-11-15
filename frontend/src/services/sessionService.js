import api from './api';

export const sessionService = {
  async getSessions() {
    return await api.get('/sessions');
  },

  async getSession(sessionId) {
    return await api.get(`/sessions/${sessionId}`);
  },

  async createSession(title) {
    return await api.post('/sessions', { title });
  },

  async updateSession(sessionId, title) {
    return await api.put(`/sessions/${sessionId}`, { title });
  },

  async deleteSession(sessionId) {
    return await api.delete(`/sessions/${sessionId}`);
  }
};
