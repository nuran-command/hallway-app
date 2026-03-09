import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import './theme.css';
import { ThemeProvider } from './themeStore';

// если нужно сохранять выбранную тему, можно сделать так:
// ThemeProvider сам может читать localStorage при старте

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);