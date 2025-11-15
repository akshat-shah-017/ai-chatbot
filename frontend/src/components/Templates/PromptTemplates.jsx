import { useState } from 'react';
import './PromptTemplates.css';

const TEMPLATES = [
  {
    id: 'summarize',
    name: '📝 Summarize',
    prompt: 'Please summarize the following text:\n\n'
  },
  {
    id: 'explain',
    name: '💡 Explain Code',
    prompt: 'Please explain the following code:\n\n'
  },
  {
    id: 'grammar',
    name: '✍️ Fix Grammar',
    prompt: 'Please fix the grammar and improve the following text:\n\n'
  },
  {
    id: 'translate',
    name: '🌐 Translate',
    prompt: 'Please translate the following to English:\n\n'
  },
  {
    id: 'notes',
    name: '📋 Make Notes',
    prompt: 'Create concise notes from the following:\n\n'
  },
  {
    id: 'bullet',
    name: '• Bullet Points',
    prompt: 'Convert the following to bullet points:\n\n'
  }
];

const PromptTemplates = ({ onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (template) => {
    onSelect(template.prompt);
    setIsOpen(false);
  };

  return (
    <div className="prompt-templates">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="templates-toggle"
        title="Quick actions"
      >
        ⚡
      </button>

      {isOpen && (
        <>
          <div className="templates-backdrop" onClick={() => setIsOpen(false)} />
          <div className="templates-dropdown">
            <div className="templates-header">Quick Actions</div>
            {TEMPLATES.map(template => (
              <button
                key={template.id}
                onClick={() => handleSelect(template)}
                className="template-item"
              >
                {template.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PromptTemplates;