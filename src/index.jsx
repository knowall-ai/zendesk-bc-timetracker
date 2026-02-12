import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { initializeClient } from './services/zendeskService';

// Initialize ZAF Client
const client = initializeClient();

if (client) {
  // Wait for app to be registered with Zendesk
  client.on('app.registered', () => {
    const container = document.getElementById('root');
    const root = createRoot(container);
    root.render(<App />);
  });
} else {
  // Development mode - render without ZAF
  console.warn('ZAF Client not available. Running in development mode.');
  const container = document.getElementById('root');
  const root = createRoot(container);
  root.render(<App />);
}
