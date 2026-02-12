import React from 'react';
import { formatCustomer } from '../utils/helpers';

const ClientSelector = ({ 
  customers, 
  selectedCustomer, 
  onChange, 
  loading, 
  disabled 
}) => {
  return (
    <div className="form-group">
      <label htmlFor="client-select">Client</label>
      <select
        id="client-select"
        value={selectedCustomer || ''}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={disabled || loading}
        className="form-control"
      >
        <option value="">-- Select a client --</option>
        {customers.map((customer) => (
          <option key={customer.id} value={customer.id}>
            {formatCustomer(customer)}
          </option>
        ))}
      </select>
      {loading && <span className="loading-indicator">Loading clients...</span>}
    </div>
  );
};

export default ClientSelector;
