import React, { useEffect } from 'react';

const StatusMessage = ({ type, message, onDismiss, autoDismiss = 5000 }) => {
  useEffect(() => {
    if (type === 'success' && autoDismiss) {
      const timer = setTimeout(() => {
        onDismiss();
      }, autoDismiss);
      return () => clearTimeout(timer);
    }
  }, [type, autoDismiss, onDismiss]);

  if (!message) return null;

  return (
    <div className={`status-message ${type}`}>
      <span className="status-icon">
        {type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
      </span>
      <span className="status-text">{message}</span>
      <button className="dismiss-button" onClick={onDismiss} aria-label="Dismiss">
        ×
      </button>
    </div>
  );
};

export default StatusMessage;
