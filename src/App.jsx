import React, { useState, useEffect, useCallback } from 'react';
import ClientSelector from './components/ClientSelector';
import ProjectSelector from './components/ProjectSelector';
import TaskSelector from './components/TaskSelector';
import TimeEntry from './components/TimeEntry';
import SaveButton from './components/SaveButton';
import StatusMessage from './components/StatusMessage';
import { zdService } from './services/zendeskService';
import { bcService, initializeBC } from './services/businessCentralService';
import { formatDate, validateTime, buildDescriptionWithTicketUrl, cache } from './utils/helpers';
import './styles.css';

const App = () => {
  // Loading states
  const [initializing, setInitializing] = useState(true);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [saving, setSaving] = useState(false);

  // Data states
  const [customers, setCustomers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [ticketUrl, setTicketUrl] = useState('');

  // Form states
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');

  // UI states
  const [status, setStatus] = useState({ type: null, message: null });

  // Initialize the app
  useEffect(() => {
    const initialize = async () => {
      try {
        // Get Zendesk settings
        const settings = await zdService.getSettings();
        
        // Initialize Business Central service
        initializeBC(settings);

        // Get current agent and find matching BC employee
        const agent = await zdService.getCurrentAgent();
        try {
          const emp = await bcService.getEmployeeByEmail(agent.email);
          setEmployee(emp);
        } catch (err) {
          setStatus({
            type: 'error',
            message: `Employee not found in Business Central for email: ${agent.email}. Please contact your administrator.`,
          });
          setInitializing(false);
          return;
        }

        // Get ticket URL for description
        const url = await zdService.getTicketUrl();
        setTicketUrl(url);

        // Load customers
        await loadCustomers();

        setInitializing(false);
      } catch (error) {
        console.error('Initialization error:', error);
        setStatus({
          type: 'error',
          message: `Failed to initialize: ${error.message}`,
        });
        setInitializing(false);
      }
    };

    initialize();
  }, []);

  // Load customers from BC
  const loadCustomers = async () => {
    setLoadingCustomers(true);
    try {
      // Check cache first
      const cached = cache.get('customers');
      if (cached) {
        setCustomers(cached);
        setLoadingCustomers(false);
        return;
      }

      const data = await bcService.getCustomers();
      setCustomers(data);
      cache.set('customers', data, 15);
    } catch (error) {
      setStatus({
        type: 'error',
        message: `Failed to load clients: ${error.message}`,
      });
    } finally {
      setLoadingCustomers(false);
    }
  };

  // Load jobs when customer changes
  const loadJobs = useCallback(async (customerId) => {
    setLoadingJobs(true);
    setJobs([]);
    setSelectedJob(null);
    setTasks([]);
    setSelectedTask(null);

    try {
      const cacheKey = customerId ? `jobs_${customerId}` : 'jobs_all';
      const cached = cache.get(cacheKey);
      if (cached) {
        setJobs(cached);
        setLoadingJobs(false);
        return;
      }

      const data = await bcService.getJobs(customerId);
      setJobs(data);
      cache.set(cacheKey, data, 10);
    } catch (error) {
      setStatus({
        type: 'error',
        message: `Failed to load projects: ${error.message}`,
      });
    } finally {
      setLoadingJobs(false);
    }
  }, []);

  // Load tasks when job changes
  const loadTasks = useCallback(async (jobId) => {
    if (!jobId) {
      setTasks([]);
      setSelectedTask(null);
      return;
    }

    setLoadingTasks(true);
    try {
      const cacheKey = `tasks_${jobId}`;
      const cached = cache.get(cacheKey);
      if (cached) {
        setTasks(cached);
        setLoadingTasks(false);
        return;
      }

      const data = await bcService.getJobTasks(jobId);
      setTasks(data);
      cache.set(cacheKey, data, 10);
    } catch (error) {
      // Tasks are optional, don't show error
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  }, []);

  // Handle customer selection
  const handleCustomerChange = (customerId) => {
    setSelectedCustomer(customerId);
    if (customerId) {
      loadJobs(customerId);
    } else {
      // Load all jobs if no customer selected
      loadJobs(null);
    }
  };

  // Handle job selection
  const handleJobChange = (jobId) => {
    setSelectedJob(jobId);
    loadTasks(jobId);
  };

  // Validate form
  const isFormValid = () => {
    return (
      selectedJob &&
      hours &&
      validateTime(hours) &&
      description.trim().length > 0 &&
      employee
    );
  };

  // Get selected job details
  const getSelectedJobDetails = () => {
    return jobs.find((j) => j.id === selectedJob);
  };

  // Handle save
  const handleSave = async () => {
    if (!isFormValid()) return;

    setSaving(true);
    setStatus({ type: null, message: null });

    try {
      const job = getSelectedJobDetails();
      const fullDescription = buildDescriptionWithTicketUrl(description.trim(), ticketUrl);

      const entryData = {
        employeeId: employee.id,
        jobId: selectedJob,
        jobNumber: job?.no,
        jobTaskNumber: selectedTask || undefined,
        date: formatDate(new Date()),
        quantity: parseFloat(hours),
        description: fullDescription,
      };

      await bcService.createTimeEntry(entryData);

      setStatus({
        type: 'success',
        message: 'Time entry saved to Business Central!',
      });

      // Clear form
      setHours('');
      setDescription('');
      setSelectedTask(null);

      // Resize to show success message
      zdService.resize(420);
    } catch (error) {
      setStatus({
        type: 'error',
        message: `Failed to save: ${error.message}`,
      });
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (initializing) {
    return (
      <div className="app-container loading">
        <div className="spinner large"></div>
        <p>Connecting to Business Central...</p>
      </div>
    );
  }

  // Error state - no employee found
  if (!employee && status.type === 'error') {
    return (
      <div className="app-container error-state">
        <div className="error-icon">⚠️</div>
        <p className="error-message">{status.message}</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>⏱️ Time Tracker</h1>
        {employee && (
          <span className="employee-badge">{employee.displayName}</span>
        )}
      </div>

      <StatusMessage
        type={status.type}
        message={status.message}
        onDismiss={() => setStatus({ type: null, message: null })}
      />

      <form className="time-form" onSubmit={(e) => e.preventDefault()}>
        <ClientSelector
          customers={customers}
          selectedCustomer={selectedCustomer}
          onChange={handleCustomerChange}
          loading={loadingCustomers}
          disabled={saving}
        />

        <ProjectSelector
          jobs={jobs}
          selectedJob={selectedJob}
          onChange={handleJobChange}
          loading={loadingJobs}
          disabled={saving}
        />

        <TaskSelector
          tasks={tasks}
          selectedTask={selectedTask}
          onChange={setSelectedTask}
          loading={loadingTasks}
          disabled={saving}
        />

        <TimeEntry
          hours={hours}
          description={description}
          onHoursChange={setHours}
          onDescriptionChange={setDescription}
          disabled={saving}
        />

        <SaveButton
          onClick={handleSave}
          disabled={!isFormValid()}
          loading={saving}
        />
      </form>

      <div className="app-footer">
        <small>Ticket link will be added to description</small>
      </div>
    </div>
  );
};

export default App;
