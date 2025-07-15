import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Paper, Alert, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getExchangeRates } from '../services/api';
import ExchangeRatesSummary from '../components/ExchangeRatesSummary';
import ExpensePieChart from '../components/Charts/ExpensePieChart';
import ExpenseLineChart from '../components/Charts/ExpenseLineChart';
import IncomeBarChart from '../components/Charts/IncomeExpenseBarChart';
import {
  FaHome,
  FaCoins,
  FaCog,
  FaTrashAlt,
  FaPrint,
} from 'react-icons/fa';
import { saveUserData } from '../utils/persist';
import { logout } from '../redux/slices/authSlice';
import dayjs from 'dayjs';

const MARKETAUX_API_KEY = 'v7KpCfcl1r3NfmLkDC2dbUpZRbyXiALiaxIZU8kU';

// Color palette and static config outside the component
const COLOR_PALETTE = {
  light: {
    sidebarBg: '#039be5',
    sidebarColor: '#000',
    mainBg: '#fff',
    mainColor: '#111',
    summaryBg: '#fffde7',
    summaryColor: '#222',
  },
  dark: {
    sidebarBg: '#111827',
    sidebarColor: '#fff',
    mainBg: '#111',
    mainColor: '#fff',
    summaryBg: '#222',
    summaryColor: '#fff',
  },
};

// Sidebar subcomponent
const Sidebar = React.memo(({ themeMode, feature, setFeature, handleNav, handleClearData }) => {
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
            px: 2, py: 1, opacity: 0.85, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1,
            fontWeight: feature === 'exchange' ? 700 : 400,
            background: feature === 'exchange' ? (themeMode === 'dark' ? '#222' : '#b3e5fc') : 'transparent',
            borderRadius: 2,
            mb: 1,
          }}
          onClick={() => setFeature('exchange')}
        >
          <FaHome style={{ marginRight: 8 }} /> Dashboard
        </Box>
        <Box
          sx={{
            px: 2, py: 1, opacity: 0.85, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1,
            fontWeight: feature === 'transactions' ? 700 : 400,
            background: feature === 'transactions' ? (themeMode === 'dark' ? '#222' : '#b3e5fc') : 'transparent',
            borderRadius: 2,
            mb: 1,
          }}
          onClick={() => handleNav('/transactions')}
        >
          <FaCoins style={{ marginRight: 8 }} /> Transactions
        </Box>
        <Box
          sx={{
            px: 2, py: 1, opacity: 0.85, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1,
            fontWeight: feature === 'settings' ? 700 : 400,
            background: feature === 'settings' ? (themeMode === 'dark' ? '#222' : '#b3e5fc') : 'transparent',
            borderRadius: 2,
            mb: 1,
          }}
          onClick={() => handleNav('/settings')}
        >
          <FaCog style={{ marginRight: 8 }} /> Settings
        </Box>
        {/* Print button */}
        <Box
          sx={{
            px: 2, py: 1, opacity: 0.85, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1,
            fontWeight: feature === 'print' ? 700 : 400,
            background: feature === 'print' ? (themeMode === 'dark' ? '#222' : '#b3e5fc') : 'transparent',
            borderRadius: 2,
            mb: 1,
          }}
          onClick={() => handleNav('/print')}
        >
          <FaPrint style={{ marginRight: 8 }} /> Print
        </Box>
        <Box
          sx={{
            px: 2, py: 1, opacity: 0.85, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1,
            color: '#e53935',
            borderRadius: 2,
            mb: 1,
          }}
          onClick={handleClearData}
        >
          <FaTrashAlt style={{ marginRight: 8 }} /> Clear My Data
        </Box>
      </Box>
    </Box>
  );
});

// Feature Switcher subcomponent
const FeatureSwitcher = React.memo(({ feature, setFeature, sidebarBg }) => (
  <Box
    sx={{
      display: 'flex',
      gap: 2,
      mb: 2,
      px: 4,
      py: 3,
      background: sidebarBg,
      borderBottom: `2px solid ${sidebarBg}`,
    }}
  >
    <button
      style={{
        fontWeight: feature === 'exchange' ? 700 : 400,
        fontSize: 18,
        padding: '6px 18px',
        background: feature === 'exchange' ? '#fff' : sidebarBg,
        color: feature === 'exchange' ? sidebarBg : '#fff',
        border: `2px solid #fff`,
        borderRadius: 4,
        marginRight: 8,
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onClick={() => setFeature('exchange')}
    >
      View Exchange Rates
    </button>
    <button
      style={{
        fontWeight: feature === 'converter' ? 700 : 400,
        fontSize: 18,
        padding: '6px 18px',
        background: feature === 'converter' ? '#fff' : sidebarBg,
        color: feature === 'converter' ? sidebarBg : '#fff',
        border: `2px solid #fff`,
        borderRadius: 4,
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onClick={() => setFeature('converter')}
    >
      Currency Converter
    </button>
  </Box>
));

// News List subcomponent
const NewsList = React.memo(({ news, newsLoading, newsError, themeMode, apiKey }) => {
  if (apiKey === 'YOUR_API_KEY') {
    return (
      <p style={{ textAlign: 'center', color: '#888', fontFamily: 'sans-serif' }}>
        Set your Marketaux API key in <code>Dashboard.js</code> to enable news.
      </p>
    );
  }
  if (newsLoading) {
    return <p style={{ textAlign: 'center', color: '#888', fontFamily: 'sans-serif' }}>Loading news...</p>;
  }
  if (newsError) {
    return <p style={{ textAlign: 'center', color: '#e53935', fontFamily: 'sans-serif' }}>{newsError}</p>;
  }
  if (!news || news.length === 0) {
    return <p style={{ textAlign: 'center', color: '#888', fontFamily: 'sans-serif' }}>No news found.</p>;
  }
  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {news.slice(0, 5).map((item) => (
        <li
          key={item.id}
          style={{
            display: 'flex',
            gap: 16,
            borderRadius: 8,
            padding: 12,
            marginBottom: 12,
            boxShadow: themeMode === 'dark'
              ? '0 2px 8px rgba(0,0,0,0.5)'
              : '0 2px 8px rgba(0,0,0,0.08)',
            background: themeMode === 'dark' ? '#181a20' : '#f7f7f7',
          }}
        >
          <img
            src={item.image_url || "https://placehold.co/48x48?text=News"}
            alt="news"
            style={{
              width: 80,
              height: 60,
              objectFit: 'cover',
              borderRadius: 6,
              border: '1px solid #ccc',
              flexShrink: 0,
            }}
            onError={e => { e.target.onerror = null; e.target.src = "https://placehold.co/80x60?text=No+Image"; }}
          />
          <div style={{ flex: 1 }}>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontWeight: 900,
                fontSize: '1.1rem',
                textDecoration: 'underline',
                fontFamily: 'serif',
                display: 'block',
                marginBottom: 4,
                color: themeMode === 'dark' ? '#90caf9' : '#1976d2',
                lineHeight: 1.3,
                wordBreak: 'break-word',
                letterSpacing: 0.2,
              }}
            >
              {item.title}
            </a>
            <div style={{
              fontSize: '0.95rem',
              marginBottom: 6,
              fontFamily: 'monospace',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: themeMode === 'dark' ? '#bbb' : '#333',
            }}>
              <span>{item.published_at?.slice(0, 10)}</span>
              {item.source && (
                <span style={{
                  marginLeft: 8,
                  padding: '2px 10px',
                  borderRadius: 12,
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  letterSpacing: 0.5,
                  background: themeMode === 'dark' ? '#23272f' : '#e3f2fd',
                  color: themeMode === 'dark' ? '#fff' : '#1976d2',
                }}>
                  {item.source}
                </span>
              )}
            </div>
            {item.description && (
              <p style={{
                fontSize: '1.05rem',
                fontFamily: 'sans-serif',
                margin: 0,
                lineHeight: 1.5,
                fontWeight: 400,
                letterSpacing: 0.1,
                color: themeMode === 'dark' ? '#eee' : '#222',
              }}>
                {item.description}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
});

const Dashboard = () => {
  const username = useSelector((state) => state.auth.username);
  const themeMode = useSelector((state) => state.settings.theme);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Color palette for light/dark mode
  const palette = COLOR_PALETTE[themeMode] || COLOR_PALETTE['light'];

  const [localRates, setLocalRates] = useState({});
  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('INR');
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [feature, setFeature] = useState('exchange'); // 'exchange' or 'converter'

  // Financial news state
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState(null);

  const currency = useSelector((state) => state.settings.currency);
  const monthlyBudget = useSelector((state) => state.settings.monthlyBudget) || 0;
  const transactions = useSelector((state) => state.transactions.transactions);

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

  // Persist transactions to localStorage per user
  useEffect(() => {
    if (username) {
      saveUserData(username, 'transactions', transactions);
    }
  }, [transactions, username]);

  // Persist currency and monthlyBudget to localStorage per user
  useEffect(() => {
    if (username) {
      saveUserData(username, 'currency', currency);
      saveUserData(username, 'monthlyBudget', monthlyBudget);
    }
  }, [currency, monthlyBudget, username]);

  useEffect(() => {
    async function fetchRates() {
      const result = await getExchangeRates();
      setLocalRates(result);
    }
    fetchRates();
  }, []);

  // Fetch financial news (Marketaux)
  useEffect(() => {
    async function fetchNews() {
      setNewsLoading(true);
      setNewsError(null);
      try {
        const res = await fetch(
          `https://api.marketaux.com/v1/news/all?api_token=${MARKETAUX_API_KEY}&symbols=AAPL,TSLA&filter_entities=true&language=en`
        );
        if (!res.ok) throw new Error('Failed to fetch news');
        const data = await res.json();
        setNews(data.data || []);
      } catch (err) {
        setNewsError('Could not load news.');
      } finally {
        setNewsLoading(false);
      }
    }
    if (MARKETAUX_API_KEY && MARKETAUX_API_KEY !== 'YOUR_API_KEY') {
      fetchNews();
    }
  }, []);

  // Memoized derived values
  const now = React.useMemo(() => new Date(), []);
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthTransactions = React.useMemo(() =>
    transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
    }), [transactions, currentMonth, currentYear]
  );

  const recentTransactions = React.useMemo(() =>
    [...currentMonthTransactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3),
    [currentMonthTransactions]
  );

  const incomeTotal = React.useMemo(() =>
    currentMonthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0),
    [currentMonthTransactions]
  );

  const expenseTotal = React.useMemo(() =>
    currentMonthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0),
    [currentMonthTransactions]
  );

  const overBudget = React.useMemo(() => expenseTotal > monthlyBudget, [expenseTotal, monthlyBudget]);
  const overBudgetAmount = React.useMemo(() => (expenseTotal - monthlyBudget).toFixed(2), [expenseTotal, monthlyBudget]);
  const remainingBudget = React.useMemo(() => (monthlyBudget - expenseTotal).toFixed(2), [expenseTotal, monthlyBudget]);

  // Memoized handlers
  const handleConvert = React.useCallback(() => {
    if (!localRates || !localRates[fromCurrency] || !localRates[toCurrency]) return;
    const rate = localRates[toCurrency] / localRates[fromCurrency];
    const result = amount * rate;
    setConvertedAmount(result.toFixed(2));
  }, [localRates, fromCurrency, toCurrency, amount]);

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

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: palette.mainBg }}>
      {/* Sidebar */}
      <Sidebar
        themeMode={themeMode}
        feature={feature}
        setFeature={setFeature}
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
        {/* Feature Switcher - blue bar */}
        <FeatureSwitcher feature={feature} setFeature={setFeature} sidebarBg={palette.sidebarBg} />

        {/* --- Reminder Alert at the top --- */}
        {showReminder && (
          <Alert
            severity="warning"
            sx={{ mb: 3, fontWeight: 600, borderRadius: 0 }}
          >
            You have a future transaction due within 24 hours! Go to the Transactions page to review or mark as paid.
          </Alert>
        )}

        <Box sx={{ p: 4 }}>
          {/* Feature Content */}
          {feature === 'exchange' && (
            <Paper elevation={2} sx={{ p: 2, mb: 4, border: `2px solid ${palette.sidebarBg}`, background: palette.mainBg, color: palette.mainColor }}>
              <ExchangeRatesSummary rates={localRates} baseCurrency={fromCurrency} />
            </Paper>
          )}
          {feature === 'converter' && (
            <Paper elevation={2} sx={{ p: 2, mb: 4, border: `2px solid ${palette.sidebarBg}`, background: palette.mainBg, color: palette.mainColor }}>
              <Box sx={{ fontWeight: 700, fontSize: 20, mb: 2, fontFamily: 'serif', textAlign: 'center' }}>
                Currency Converter
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, justifyContent: 'center' }}>
                <input
                  type="number"
                  value={amount}
                  min={0}
                  onChange={e => setAmount(Number(e.target.value))}
                  style={{
                    fontWeight: 700,
                    fontSize: 18,
                    padding: '6px 12px',
                    background: palette.mainBg,
                    color: palette.mainColor,
                    border: `2px solid ${palette.sidebarBg}`,
                    borderRadius: 4,
                    width: 120,
                  }}
                />
                <select
                  value={fromCurrency}
                  onChange={e => setFromCurrency(e.target.value)}
                  style={{
                    fontWeight: 700,
                    fontSize: 18,
                    padding: '6px 12px',
                    background: palette.mainBg,
                    color: palette.mainColor,
                    border: `2px solid ${palette.sidebarBg}`,
                    borderRadius: 4,
                  }}
                >
                  {Object.keys(localRates).map(cur => (
                    <option key={cur} value={cur}>{cur}</option>
                  ))}
                </select>
                <span style={{ fontWeight: 700, fontSize: 18 }}>to</span>
                <select
                  value={toCurrency}
                  onChange={e => setToCurrency(e.target.value)}
                  style={{
                    fontWeight: 700,
                    fontSize: 18,
                    padding: '6px 12px',
                    background: palette.mainBg,
                    color: palette.mainColor,
                    border: `2px solid ${palette.sidebarBg}`,
                    borderRadius: 4,
                  }}
                >
                  {Object.keys(localRates).map(cur => (
                    <option key={cur} value={cur}>{cur}</option>
                  ))}
                </select>
                <button
                  onClick={handleConvert}
                  style={{
                    fontWeight: 700,
                    fontSize: 18,
                    padding: '6px 18px',
                    background: '#43a047',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                >
                  Convert
                </button>
              </Box>
              {convertedAmount && (
                <Box sx={{ textAlign: 'center', fontWeight: 700, fontSize: 18, mt: 2 }}>
                  {amount} {fromCurrency} = {convertedAmount} {toCurrency}
                </Box>
              )}
            </Paper>
          )}

          {/* Summary Bar */}
          <Box
            sx={{
              background: palette.summaryBg,
              color: palette.summaryColor,
              border: `1px solid ${palette.sidebarBg}`,
              borderRadius: 2,
              px: 2,
              py: 1,
              mb: 3,
              fontWeight: 600,
              fontSize: 15,
              display: 'flex',
              gap: 2,
            }}
          >
            Total Income: {currency} {incomeTotal.toFixed(2)} &nbsp; 
            Total Expense: {currency} {expenseTotal.toFixed(2)} &nbsp; 
            Budget: {currency} {monthlyBudget.toFixed(2)} &nbsp; 
            {overBudget ? "Over" : "Under"} Budget: {currency} {overBudget ? overBudgetAmount : remainingBudget}
          </Box>

          {/* Charts */}
          <Box sx={{ display: 'flex', gap: 4, mb: 4 }}>
            <Paper
              elevation={2}
              sx={{
                flex: 1,
                p: 2,
                border: `2px solid ${palette.sidebarBg}`,
                background: palette.mainBg,
                color: palette.mainColor,
                minHeight: 220,
              }}
            >
              <Box sx={{ fontWeight: 700, fontSize: 18, mb: 2, fontFamily: 'serif' }}>
                Expense by Category
              </Box>
              <ExpensePieChart width={350} height={180} />
            </Paper>
            <Paper
              elevation={2}
              sx={{
                flex: 1,
                p: 2,
                border: `2px solid ${palette.sidebarBg}`,
                background: palette.mainBg,
                color: palette.mainColor,
                minHeight: 220,
              }}
            >
              <Box sx={{ fontWeight: 700, fontSize: 18, mb: 2, fontFamily: 'serif' }}>
                Income Overview
              </Box>
              <IncomeBarChart width={350} height={180} />
            </Paper>
          </Box>

          {/* Line Chart */}
          <Paper elevation={2} sx={{ p: 2, mb: 4, border: `2px solid ${palette.sidebarBg}`, background: palette.mainBg, color: palette.mainColor }}>
            <Box sx={{ fontWeight: 700, fontSize: 18, mb: 2, fontFamily: 'serif', textAlign: 'center' }}>
              Monthly Expense Trends
            </Box>
            <Box className="flex justify-center">
              <ExpenseLineChart width={700} height={180} />
            </Box>
          </Paper>

          {/* Recent Transactions */}
          <Paper elevation={2} sx={{ p: 2, mb: 4, border: `2px solid ${palette.sidebarBg}`, background: palette.mainBg, color: palette.mainColor }}>
            <Box sx={{ fontWeight: 700, fontSize: 18, mb: 2, fontFamily: 'serif', textAlign: 'center' }}>
              Recent Transactions
            </Box>
            <ul>
              {recentTransactions.length === 0 ? (
                <li style={{ textAlign: 'center', color: '#888', fontFamily: 'sans-serif' }}>No transactions yet.</li>
              ) : (
                recentTransactions.map((t, idx) => (
                  <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', padding: '6px 0' }}>
                    <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description || t.category}</span>
                    <span style={{ color: t.type === 'income' ? '#43a047' : '#e53935', fontWeight: 700 }}>
                      {t.type === 'income' ? '+' : '-'}{currency} {Number(t.amount).toFixed(2)}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </Paper>

          {/* Financial News */}
          <Paper elevation={2} sx={{ p: 2, mb: 4, border: `2px solid ${palette.sidebarBg}`, background: palette.mainBg, color: palette.mainColor }}>
            <Box sx={{ fontWeight: 700, fontSize: 18, mb: 2, fontFamily: 'serif', textAlign: 'center' }}>
              <span role="img" aria-label="news">📰</span> Financial News
            </Box>
            <NewsList news={news} newsLoading={newsLoading} newsError={newsError} themeMode={themeMode} apiKey={MARKETAUX_API_KEY} />
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;