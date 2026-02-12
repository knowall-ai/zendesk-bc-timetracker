import React from 'react';
import { validateTime } from '../utils/helpers';

const TimeEntry = ({ 
  hours, 
  description, 
  onHoursChange, 
  onDescriptionChange, 
  disabled 
}) => {
  const isValidTime = hours === '' || validateTime(hours);
  const remainingChars = 250 - (description?.length || 0);
  
  return (
    <>
      <div className="form-group">
        <label htmlFor="time-input">Time</label>
        <div className="time-input-wrapper">
          <input
            id="time-input"
            type="number"
            step="0.25"
            min="0.25"
            max="24"
            value={hours}
            onChange={(e) => onHoursChange(e.target.value)}
            disabled={disabled}
            className={`form-control time-input ${!isValidTime ? 'invalid' : ''}`}
            placeholder="0.00"
          />
          <span className="time-unit">hours</span>
        </div>
        {!isValidTime && (
          <span className="error-text">Please enter a valid time (0.25 - 24 hours)</span>
        )}
      </div>
      
      <div className="form-group">
        <label htmlFor="description-input">Description</label>
        <textarea
          id="description-input"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          disabled={disabled}
          className="form-control"
          placeholder="Describe the work performed..."
          maxLength={250}
          rows={3}
        />
        <span className={`char-counter ${remainingChars < 50 ? 'warning' : ''}`}>
          {remainingChars} characters remaining
        </span>
      </div>
    </>
  );
};

export default TimeEntry;
