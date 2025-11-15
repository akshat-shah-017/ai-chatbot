import { useState, useRef } from 'react';
import PromptTemplates from '../Templates/PromptTemplates';
import FileUpload from '../FileUpload/FileUpload';
import './InputArea.css';

const InputArea = ({ onSend, disabled, sessionId }) => {
  const [input, setInput] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const textareaRef = useRef(null);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!input.trim() || disabled) return;

    const fileIds = uploadedFiles.map(f => f.fileId);
    await onSend(input, fileIds);
    
    setInput('');
    setUploadedFiles([]);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaChange = (e) => {
    setInput(e.target.value);
    
    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
  };

  const handleTemplateSelect = (template) => {
    setInput(template);
    textareaRef.current?.focus();
  };

  const handleFileUpload = (file) => {
    setUploadedFiles(prev => [...prev, file]);
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.fileId !== fileId));
  };

  return (
    <div className="input-area">
      <PromptTemplates onSelect={handleTemplateSelect} />
      
      {uploadedFiles.length > 0 && (
        <div className="uploaded-files-preview">
          {uploadedFiles.map(file => (
            <div key={file.fileId} className="file-chip">
              <span>{file.fileName}</span>
              <button onClick={() => removeFile(file.fileId)}>×</button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="input-form">
        <FileUpload sessionId={sessionId} onUpload={handleFileUpload} />
        
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Shift+Enter for new line)"
          className="input-textarea"
          disabled={disabled}
          rows={1}
        />
        
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="send-button"
        >
          {disabled ? '⏳' : '➤'}
        </button>
      </form>
    </div>
  );
};

export default InputArea;