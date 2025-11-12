import React from 'react';

const TypingIndicator = () => {
  return (
    <div className="message bot">
      <div className="message-bubble">
        <div className="typing-indicator">
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;