import React from 'react';
import { formatJob } from '../utils/helpers';

const ProjectSelector = ({ 
  jobs, 
  selectedJob, 
  onChange, 
  loading, 
  disabled 
}) => {
  return (
    <div className="form-group">
      <label htmlFor="project-select">Project</label>
      <select
        id="project-select"
        value={selectedJob || ''}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={disabled || loading || jobs.length === 0}
        className="form-control"
      >
        <option value="">-- Select a project --</option>
        {jobs.map((job) => (
          <option key={job.id} value={job.id}>
            {formatJob(job)}
          </option>
        ))}
      </select>
      {loading && <span className="loading-indicator">Loading projects...</span>}
      {!loading && jobs.length === 0 && (
        <span className="help-text">No open projects available</span>
      )}
    </div>
  );
};

export default ProjectSelector;
