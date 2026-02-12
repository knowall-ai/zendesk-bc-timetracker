import React from 'react';

const SaveButton = ({ onClick, disabled, loading }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`save-button ${loading ? 'loading' : ''}`}
    >
      {loading ? (
        <>
          <span className="spinner"></span>
          Saving...
        </>
      ) : (
        'Log Time'
      )}
    </button>
  );
};

export default SaveButton;
