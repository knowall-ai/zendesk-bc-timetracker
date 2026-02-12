/**
 * Business Central Service - BC API v2.0 wrapper
 */

let config = null;

export const initializeBC = (settings) => {
  config = {
    tenantId: settings.bc_tenant_id,
    environment: settings.bc_environment || 'production',
    companyId: settings.bc_company_id,
    username: settings.bc_username,
    password: settings.bc_password,
  };
  
  return config;
};

const getBaseUrl = () => {
  return `https://api.businesscentral.dynamics.com/v2.0/${config.tenantId}/${config.environment}/api/v2.0/companies(${config.companyId})`;
};

const getAuthHeader = () => {
  const credentials = btoa(`${config.username}:${config.password}`);
  return `Basic ${credentials}`;
};

const fetchBC = async (endpoint, options = {}) => {
  if (!config) throw new Error('Business Central not initialized');
  
  const url = `${getBaseUrl()}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error?.message || errorText;
    } catch {
      errorMessage = errorText;
    }
    throw new Error(`BC API Error (${response.status}): ${errorMessage}`);
  }
  
  if (response.status === 204) return null;
  return response.json();
};

export const bcService = {
  /**
   * Get all customers from Business Central
   */
  async getCustomers() {
    const result = await fetchBC('/customers?$select=id,number,displayName&$orderby=displayName');
    return result.value || [];
  },

  /**
   * Get jobs/projects from Business Central
   * Optionally filter by customer
   */
  async getJobs(customerId = null) {
    let endpoint = '/jobs?$select=id,no,description,billToCustomerId,status&$filter=status eq \'Open\'&$orderby=no';
    
    if (customerId) {
      endpoint = `/jobs?$select=id,no,description,billToCustomerId,status&$filter=billToCustomerId eq ${customerId} and status eq 'Open'&$orderby=no`;
    }
    
    const result = await fetchBC(endpoint);
    return result.value || [];
  },

  /**
   * Get job tasks for a specific job
   */
  async getJobTasks(jobId) {
    const result = await fetchBC(`/jobs(${jobId})/jobTasks?$select=jobTaskNo,description&$orderby=jobTaskNo`);
    return result.value || [];
  },

  /**
   * Get employee by email address
   */
  async getEmployeeByEmail(email) {
    const result = await fetchBC(`/employees?$filter=email eq '${email}'&$select=id,number,displayName,email`);
    const employees = result.value || [];
    
    if (employees.length === 0) {
      throw new Error(`No employee found with email: ${email}`);
    }
    
    return employees[0];
  },

  /**
   * Create a time registration entry
   */
  async createTimeEntry(entryData) {
    const payload = {
      employeeId: entryData.employeeId,
      date: entryData.date,
      quantity: entryData.quantity,
      unitOfMeasureCode: 'HOUR',
    };

    // Add job fields if provided
    if (entryData.jobId) {
      payload.jobId = entryData.jobId;
    }
    if (entryData.jobNumber) {
      payload.jobNumber = entryData.jobNumber;
    }
    if (entryData.jobTaskNumber) {
      payload.jobTaskNumber = entryData.jobTaskNumber;
    }
    
    // Description with ticket link
    if (entryData.description) {
      payload.description = entryData.description.substring(0, 250);
    }
    
    const result = await fetchBC('/timeRegistrationEntries', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    
    return result;
  },

  /**
   * Test connection to Business Central
   */
  async testConnection() {
    try {
      await fetchBC('/customers?$top=1');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

export default bcService;
