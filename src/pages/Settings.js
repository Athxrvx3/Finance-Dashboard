import React, { useContext, useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Switch,
  Paper,
  Alert,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrency, setMonthlyBudget } from '../redux/slices/settingsSlice';
import { ThemeContext } from '../index';
import {
  FaHome,
  FaCoins,
  FaCog,
  FaTrashAlt,
  FaPrint,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/slices/authSlice';
import dayjs from 'dayjs';

// Color palette and static config outside the component
const COLOR_PALETTE = {
  light: {
    sidebarBg: '#039be5',
    sidebarColor: '#000',
    mainBg: '#fff',
    mainColor: '#111',
    navActiveBg: '#b3e5fc',
    navDanger: '#e53935',
  },
  dark: {
    sidebarBg: '#111827',
    sidebarColor: '#fff',
    mainBg: '#111',
    mainColor: '#fff',
    navActiveBg: '#222',
    navDanger: '#e53935',
  },
};

const navStyle = {
  px: 2,
  py: 1,
  fontSize: 16,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  borderRadius: 2,
  mb: 1,
  opacity: 0.85,
};

// Sidebar subcomponent
const Sidebar = React.memo(({ themeMode, feature, handleNav, handleClearData }) => {
  const palette = COLOR_PALETTE[themeMode] || COLOR_PALETTE['light'];
  return (
    <Box
      sx={{
        width: 200,
        background: palette.sidebarBg,
        color: palette.sidebarColor,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        py: 4,
        px: 2,
      }}
    >
      <Box sx={{ mb: 4, width: '100%', display: 'flex', alignItems: 'center', gap: 1 }}>
        <span style={{ fontSize: 36, marginRight: 8 }}><FaHome /></span>
        <Box sx={{ fontWeight: 700, fontSize: 18, fontFamily: 'serif', lineHeight: 1.1 }}>
          PERSONAL FINANCE<br />DASHBOARD
        </Box>
      </Box>
      <Box sx={{ width: '100%' }}>
        <Box
          sx={{
            ...navStyle,
            fontWeight: feature === 'exchange' ? 700 : 400,
            background: feature === 'exchange' ? palette.navActiveBg : 'transparent',
          }}
          onClick={() => handleNav('/')}
        >
          <FaHome style={{ marginRight: 8 }} /> Dashboard
        </Box>
        <Box
          sx={{
            ...navStyle,
            fontWeight: feature === 'transactions' ? 700 : 400,
            background: feature === 'transactions' ? palette.navActiveBg : 'transparent',
          }}
          onClick={() => handleNav('/transactions')}
        >
          <FaCoins style={{ marginRight: 8 }} /> Transactions
        </Box>
        <Box
          sx={{
            ...navStyle,
            fontWeight: feature === 'settings' ? 700 : 400,
            background: feature === 'settings' ? palette.navActiveBg : 'transparent',
          }}
          onClick={() => handleNav('/settings')}
        >
          <FaCog style={{ marginRight: 8 }} /> Settings
        </Box>
        {/* Print button */}
        <Box
          sx={{
            ...navStyle,
            fontWeight: feature === 'print' ? 700 : 400,
            background: feature === 'print' ? palette.navActiveBg : 'transparent',
          }}
          onClick={() => handleNav('/print')}
        >
          <FaPrint style={{ marginRight: 8 }} /> Print
        </Box>
        <Box
          sx={{ ...navStyle, color: palette.navDanger }}
          onClick={handleClearData}
        >
          <FaTrashAlt style={{ marginRight: 8 }} /> Clear My Data
        </Box>
      </Box>
    </Box>
  );
});

const Settings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currency, budget } = useSelector((state) => state.settings);
  const exchangeRates = useSelector((state) => state.settings.exchangeRates);
  const themeMode = useSelector((state) => state.settings.theme);

  // Use ThemeContext for theme toggling
  const { theme, setTheme } = useContext(ThemeContext);

  const [feature] = useState('settings'); // for sidebar highlight

  // Color palette for light/dark mode
  const palette = COLOR_PALETTE[themeMode] || COLOR_PALETTE['light'];

  // Memoized currency options
  const currencyOptions = React.useMemo(() =>
    exchangeRates?.rates
      ? Object.keys(exchangeRates.rates).sort()
      : ['USD', 'EUR', 'INR', 'JPY'],
    [exchangeRates]
  );

  // Memoized handlers
  const handleCurrencyChange = React.useCallback((e) => {
    dispatch(setCurrency(e.target.value));
  }, [dispatch]);

  const handleBudgetChange = React.useCallback((e) => {
    dispatch(setMonthlyBudget(Number(e.target.value)));
  }, [dispatch]);

  const handleThemeToggle = React.useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const handleNav = React.useCallback((route) => {
    navigate(route);
  }, [navigate]);

  const handleClearData = React.useCallback(() => {
    if (window.confirm('Are you sure you want to clear all your data?')) {
      localStorage.clear();
      dispatch(logout());
      navigate('/');
    }
  }, [dispatch, navigate]);

  // --- Future Transactions Reminder Alert Logic ---
  const [showReminder, setShowReminder] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('futureTransactions');
    if (!saved) {
      setShowReminder(false);
      return;
    }
    const futureTransactions = JSON.parse(saved);
    const now = dayjs();
    const hasDueSoon = futureTransactions.some(tx => {
      const due = dayjs(tx.dueDate);
      return due.diff(now, 'hour') <= 24 && due.diff(now, 'minute') > 0;
    });
    setShowReminder(hasDueSoon);
  }, []);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: palette.mainBg }}>
      {/* Sidebar */}
      <Sidebar
        themeMode={themeMode}
        feature={feature}
        handleNav={handleNav}
        handleClearData={handleClearData}
      />
      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          background: palette.mainBg,
          color: palette.mainColor,
          p: 0,
          minHeight: '100vh',
        }}
      >
        {/* Top blue bar */}
        <Box
          sx={{
            px: 4,
            py: 3,
            background: palette.sidebarBg,
            borderBottom: `2px solid ${palette.sidebarBg}`,
            mb: 2,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              color: '#fff',
              fontWeight: 700,
              fontFamily: 'serif',
              letterSpacing: 1,
            }}
          >
            Settings
          </Typography>
        </Box>
        {/* Reminder Alert at the top */}
        {showReminder && (
          <Alert
            severity="warning"
            sx={{ mb: 3, fontWeight: 600, borderRadius: 0 }}
          >
            You have a future transaction due within 24 hours! Go to the Transactions page to review or mark as paid.
          </Alert>
        )}
        <Box sx={{ p: 4, maxWidth: 400 }}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Currency</InputLabel>
            <Select value={currency} label="Currency" onChange={handleCurrencyChange}>
              {currencyOptions.map((cur) => (
                <MenuItem key={cur} value={cur}>
                  {cur}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Add Budget"
            type="number"
            value={budget}
            onChange={handleBudgetChange}
            sx={{ mb: 3 }}
          />
          <Box display="flex" alignItems="center" gap={2}>
            <Typography>Dark Mode</Typography>
            <Switch checked={theme === 'dark'} onChange={handleThemeToggle} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Settings;