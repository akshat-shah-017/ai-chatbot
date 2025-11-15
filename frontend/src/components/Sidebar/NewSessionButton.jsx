import './NewSessionButton.css';

const NewSessionButton = ({ onClick }) => {
  return (
    <button onClick={onClick} className="new-session-button">
      <span className="new-session-icon">+</span>
      <span>New Chat</span>
    </button>
  );
};

export default NewSessionButton;