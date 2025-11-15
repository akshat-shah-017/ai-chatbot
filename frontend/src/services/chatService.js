import api from './api';

export const chatService = {
  async getMessages(sessionId, limit = 50) {
    return await api.get(`/messages/${sessionId}`, { params: { limit } });
  },

  async sendMessage(sessionId, content, fileIds = []) {
    return await api.post('/chat/send', { sessionId, content, fileIds });
  },

  async streamMessage(sessionId, content, fileIds = [], onChunk) {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ sessionId, content, fileIds })
    });

    if (!response.ok) {
      throw new Error('Stream request failed');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          
          if (data.done) {
            return;
          }
          
          if (data.content) {
            onChunk(data.content);
          }
        }
      }
    }
  },

  async regenerateResponse(sessionId) {
    return await api.post('/chat/regenerate', { sessionId });
  },

  async editMessage(messageId, content) {
    return await api.put(`/messages/${messageId}`, { content });
  },

  async deleteMessage(messageId) {
    return await api.delete(`/messages/${messageId}`);
  }
};
