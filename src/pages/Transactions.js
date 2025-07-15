import React, { useState } from 'react';
import AddTransactionForm from '../components/Forms/AddTransactionForm';
import TransactionTable from '../components/Transactions/TransactionTable';
import { Box, Typography, Paper, Alert, Button, TextField, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  FaHome,
  FaCoins,
  FaCog,
  FaTrashAlt,
  FaPrint,
} from 'react-icons/fa';
import { logout } from '../redux/slices/authSlice';
import { addTransaction } from '../redux/slices/transactionSlice';
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

const Transactions = () => {
  const themeMode = useSelector((state) => state.settings.theme);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [feature] = useState('transactions');

  // Color palette for light/dark mode
  const palette = COLOR_PALETTE[themeMode] || COLOR_PALETTE['light'];

  // Memoized handlers
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

  // --- Future Transactions State and Logic ---
  const [futureTransactions, setFutureTransactions] = useState(() => {
    const saved = localStorage.getItem('futureTransactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [futureForm, setFutureForm] = useState({
    description: '',
    amount: '',
    dueDate: '',
  });
  const [showReminder, setShowReminder] = useState(false);

  React.useEffect(() => {
    localStorage.setItem('futureTransactions', JSON.stringify(futureTransactions));
  }, [futureTransactions]);

  React.useEffect(() => {
    const now = dayjs();
    const hasDueSoon = futureTransactions.some(tx => {
      const due = dayjs(tx.dueDate);
      return due.diff(now, 'hour') <= 24 && due.diff(now, 'minute') > 0;
    });
    setShowReminder(hasDueSoon);
  }, [futureTransactions]);

  const handleFutureFormChange = React.useCallback((e) => {
    setFutureForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleAddFutureTransaction = React.useCallback((e) => {
    e.preventDefault();
    if (!futureForm.description || !futureForm.amount || !futureForm.dueDate) return;
    if (dayjs(futureForm.dueDate).isBefore(dayjs(), 'day')) {
      alert('Due date must be in the future!');
      return;
    }
    setFutureTransactions(prev => ([
      ...prev,
      {
        ...futureForm,
        id: Date.now(),
      },
    ]));
    setFutureForm({ description: '', amount: '', dueDate: '' });
  }, [futureForm]);

  // --- UPDATED: Mark as Paid moves to regular transactions ---
  const handleMarkAsPaid = React.useCallback((id) => {
    const tx = futureTransactions.find(t => t.id === id);
    if (tx) {
      dispatch(addTransaction({
        description: tx.description,
        amount: Number(tx.amount),
        date: tx.dueDate,
        type: 'expense',
        category: 'Future Payment',
      }));
    }
    setFutureTransactions(prev => prev.filter(tx => tx.id !== id));
  }, [futureTransactions, dispatch]);

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
            Transactions
          </Typography>
        </Box>
        <Box sx={{ p: 4 }}>
          {/* Reminder Alert */}
          {showReminder && (
            <Alert
              severity="warning"
              sx={{ mb: 3, fontWeight: 600 }}
              onClose={() => setShowReminder(false)}
            >
              You have a future transaction due within 24 hours!
            </Alert>
          )}
          {/* Future Transactions Section */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Future Transactions / Reminders
            </Typography>
            <form onSubmit={handleAddFutureTransaction}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
                <TextField
                  label="Description"
                  name="description"
                  value={futureForm.description}
                  onChange={handleFutureFormChange}
                  required
                />
                <TextField
                  label="Amount"
                  name="amount"
                  type="number"
                  value={futureForm.amount}
                  onChange={handleFutureFormChange}
                  required
                />
                <TextField
                  label="Due Date"
                  name="dueDate"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={futureForm.dueDate}
                  onChange={handleFutureFormChange}
                  required
                />
                <Button type="submit" variant="contained" color="primary">
                  Add
                </Button>
              </Stack>
            </form>
            {futureTransactions.length === 0 ? (
              <Typography color="text.secondary">No future transactions.</Typography>
            ) : (
              <Stack spacing={2}>
                {futureTransactions
                  .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                  .map(tx => (
                    <Paper
                      key={tx.id}
                      sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: themeMode === 'dark' ? '#23272f' : '#e3f2fd',
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontWeight: 600 }}>{tx.description}</Typography>
                        <Typography variant="body2">
                          Amount: <b>${tx.amount}</b> &nbsp; | &nbsp; Due: {dayjs(tx.dueDate).format('YYYY-MM-DD')}
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        color="success"
                        onClick={() => handleMarkAsPaid(tx.id)}
                      >
                        Mark as Paid
                      </Button>
                    </Paper>
                  ))}
              </Stack>
            )}
          </Paper>
          {/* Existing Add Transaction and All Transactions */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Add Transaction
            </Typography>
            <AddTransactionForm />
          </Paper>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              All Transactions
            </Typography>
            <TransactionTable />
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Transactions;