import api from './api';

export const fileService = {
  async uploadFile(sessionId, file, onProgress) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sessionId', sessionId);

    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        if (onProgress) onProgress(progress);
      }
    });

    return response;
  },

  async getSessionFiles(sessionId) {
    return await api.get(`/files/${sessionId}`);
  },

  async deleteFile(fileId) {
    return await api.delete(`/files/${fileId}`);
  }
};
