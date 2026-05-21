import './vertex-ai-proxy-interceptor.js';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// Polyfill for process.env in browser environment for the SDK
if (typeof window !== 'undefined') {
  (window as any).process = {
    env: {
      API_KEY: (window as any).process?.env?.API_KEY || ''
    }
  };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);