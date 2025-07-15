import React, { useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Settings from './pages/Settings';
import Print from './pages/Print';

import { getExchangeRates } from './services/api';
import { setExchangeRates } from './redux/slices/settingsSlice';

import './index.scss';

// Import LoginForm (create this file as per previous instructions)
import LoginForm from './components/Auth/CreatePFDdata';

function App() {
  const dispatch = useDispatch();
  const themeMode = useSelector((state) => state.settings.theme);
  const username = useSelector((state) => state.auth.username);

  // Memoize theme creation
  const theme = useMemo(() => createTheme({ palette: { mode: themeMode } }), [themeMode]);

  useEffect(() => {
    const fetchRates = async () => {
      const data = await getExchangeRates();
      if (data) {
        dispatch(setExchangeRates(data));
      }
    };

    fetchRates();
  }, [dispatch]);

  // This useEffect must be INSIDE the App function, not after it!
  useEffect(() => {
    if (themeMode === 'dark') {
      document.body.classList.add('dark');
      // Optionally: document.documentElement.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
      // Optionally: document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  if (!username) {
    // Not logged in: show login form only
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LoginForm />
      </ThemeProvider>
    );
  }

  // Logged in: show app
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/print" element={<Print />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;