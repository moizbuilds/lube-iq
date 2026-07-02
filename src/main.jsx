// Entry point: mounts the React app into the page and turns on client-side routing.
// CONCEPT: a SPA (single-page app) loads one HTML page; React swaps what you see
// as you navigate, instead of the browser fetching new pages.
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
