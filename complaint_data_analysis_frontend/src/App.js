import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import './App.css';
import Dashboard from './pages/Dashboard';
import Health from './pages/Health';

// PUBLIC_INTERFACE
function App() {
  /** Root app component: provides navigation, theme, and routes for the app. */
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  };

  const navActiveStyle = useMemo(
    () => ({ color: 'var(--primary-700)', background: 'rgba(236,72,153,0.12)' }),
    []
  );

  return (
    <BrowserRouter>
      <div className="App">
        <header className="topbar">
          <div className="brand">
            <div className="brand-logo" aria-hidden="true">💠</div>
            <div className="brand-title">MedTech Complaint Analyzer</div>
          </div>
          <nav className="nav">
            <NavLink to="/" end className="nav-link" style={({ isActive }) => (isActive ? navActiveStyle : undefined)}>
              Dashboard
            </NavLink>
            <NavLink to="/health" className="nav-link" style={({ isActive }) => (isActive ? navActiveStyle : undefined)}>
              Health
            </NavLink>
          </nav>
          <button className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </header>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/health" element={<Health />} />
          </Routes>
        </main>
        <footer className="footer">
          <span>© {new Date().getFullYear()} MedTech Complaint Analyzer</span>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
