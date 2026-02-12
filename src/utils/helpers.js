/**
 * Utility helper functions
 */

/**
 * Format date to YYYY-MM-DD for BC API
 */
export const formatDate = (date = new Date()) => {
  return date.toISOString().split('T')[0];
};

/**
 * Format customer for display
 */
export const formatCustomer = (customer) => {
  return `${customer.number} - ${customer.displayName}`;
};

/**
 * Format job/project for display
 */
export const formatJob = (job) => {
  return `${job.no} - ${job.description}`;
};

/**
 * Format job task for display
 */
export const formatJobTask = (task) => {
  return `${task.jobTaskNo} - ${task.description}`;
};

/**
 * Validate time input (must be positive decimal)
 */
export const validateTime = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0 && num <= 24;
};

/**
 * Truncate description to BC field limit
 */
export const truncateDescription = (description, maxLength = 250) => {
  if (description.length <= maxLength) return description;
  return description.substring(0, maxLength - 3) + '...';
};

/**
 * Build description with ticket URL
 */
export const buildDescriptionWithTicketUrl = (description, ticketUrl) => {
  const combined = `${description} - ${ticketUrl}`;
  return truncateDescription(combined, 250);
};

/**
 * Debounce function for input handlers
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Session storage helpers for caching
 */
export const cache = {
  set: (key, value, ttlMinutes = 15) => {
    const item = {
      value,
      expiry: Date.now() + ttlMinutes * 60 * 1000,
    };
    try {
      sessionStorage.setItem(`bc_tt_${key}`, JSON.stringify(item));
    } catch (e) {
      console.warn('Cache set failed:', e);
    }
  },
  
  get: (key) => {
    try {
      const itemStr = sessionStorage.getItem(`bc_tt_${key}`);
      if (!itemStr) return null;
      
      const item = JSON.parse(itemStr);
      if (Date.now() > item.expiry) {
        sessionStorage.removeItem(`bc_tt_${key}`);
        return null;
      }
      return item.value;
    } catch (e) {
      return null;
    }
  },
  
  clear: (key) => {
    try {
      sessionStorage.removeItem(`bc_tt_${key}`);
    } catch (e) {
      console.warn('Cache clear failed:', e);
    }
  },
};
