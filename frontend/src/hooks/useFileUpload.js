import { useState } from 'react';
import { fileService } from '../services/fileService';

export const useFileUpload = (sessionId) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const uploadFile = async (file) => {
    if (!sessionId) {
      throw new Error('No session selected');
    }

    try {
      setUploading(true);
      setError(null);
      setUploadProgress(0);

      const result = await fileService.uploadFile(sessionId, file, (progress) => {
        setUploadProgress(progress);
      });

      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteFile = async (fileId) => {
    try {
      setError(null);
      await fileService.deleteFile(fileId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    uploading,
    uploadProgress,
    error,
    uploadFile,
    deleteFile
  };
};
