import React from 'react';
import { formatJobTask } from '../utils/helpers';

const TaskSelector = ({ 
  tasks, 
  selectedTask, 
  onChange, 
  loading, 
  disabled 
}) => {
  if (!tasks || tasks.length === 0) return null;
  
  return (
    <div className="form-group">
      <label htmlFor="task-select">Task (Optional)</label>
      <select
        id="task-select"
        value={selectedTask || ''}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={disabled || loading}
        className="form-control"
      >
        <option value="">-- Select a task --</option>
        {tasks.map((task) => (
          <option key={task.jobTaskNo} value={task.jobTaskNo}>
            {formatJobTask(task)}
          </option>
        ))}
      </select>
      {loading && <span className="loading-indicator">Loading tasks...</span>}
    </div>
  );
};

export default TaskSelector;
