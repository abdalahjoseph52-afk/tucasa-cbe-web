import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import { HelmetProvider } from 'react-helmet-async'; // <--- HII ILIKOSEKANA

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* HelmetProvider inahitajika kwa SEO */}
    <HelmetProvider>
      <ThemeProvider>
        <LanguageProvider>
          {/* ToastProvider inahitajika kwa Notifications */}
          <ToastProvider>
            <App />
          </ToastProvider>
        </LanguageProvider>
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>,
);