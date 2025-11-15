import { useRef } from 'react';
import { useFileUpload } from '../../hooks/useFileUpload';
import './FileUpload.css';

const FileUpload = ({ sessionId, onUpload }) => {
  const fileInputRef = useRef(null);
  const { uploading, uploadProgress, uploadFile } = useFileUpload(sessionId);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const result = await uploadFile(file);
      if (onUpload) onUpload(result);
    } catch (error) {
      console.error('File upload failed:', error);
      alert(error.message);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="file-upload">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        disabled={uploading}
        accept=".pdf,.txt,.md,.csv,.json,.html,.js,.jsx,.ts,.tsx,.py,.java,.cpp,.css"
        className="file-upload-input"
        id="file-upload-input"
      />
      <label
        htmlFor="file-upload-input"
        className={`file-upload-button ${uploading ? 'uploading' : ''}`}
        title="Upload file"
      >
        {uploading ? `${uploadProgress}%` : '📎'}
      </label>
    </div>
  );
};

export default FileUpload;