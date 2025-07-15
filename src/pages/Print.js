import React, { useRef } from 'react';
import { Box, Button, Typography, Paper, Grid } from '@mui/material';
import ExpensePieChart from '../components/Charts/ExpensePieChart';
import ExpenseLineChart from '../components/Charts/ExpenseLineChart';
import IncomeBarChart from '../components/Charts/IncomeExpenseBarChart';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaCoins, FaCog, FaTrashAlt, FaPrint } from 'react-icons/fa';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';

// Color palette and static config outside the component
const COLOR_PALETTE = {
  light: {
    sidebarBg: '#039be5',
    sidebarColor: '#000',
    mainBg: '#fff',
    mainColor: '#111',
    summaryBg: '#fffde7',
    summaryColor: '#222',
    navActiveBg: '#b3e5fc',
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
const Sidebar = React.memo(({ handleNav, handleClearData }) => {
  const palette = COLOR_PALETTE.light;
  return (
    <Box sx={{ width: 200, background: palette.sidebarBg, color: palette.sidebarColor, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', py: 4, px: 2 }}>
      <Box sx={{ mb: 4, width: '100%', display: 'flex', alignItems: 'center', gap: 1 }}>
        <span style={{ fontSize: 36 }}><FaHome /></span>
        <Box sx={{ fontWeight: 700, fontSize: 18, fontFamily: 'serif', lineHeight: 1.1 }}>
          PERSONAL FINANCE<br />DASHBOARD
        </Box>
      </Box>
      <Box sx={{ width: '100%' }}>
        <Box sx={navStyle} onClick={() => handleNav('/')}> <FaHome style={{ marginRight: 8 }} /> Dashboard </Box>
        <Box sx={navStyle} onClick={() => handleNav('/transactions')}> <FaCoins style={{ marginRight: 8 }} /> Transactions </Box>
        <Box sx={navStyle} onClick={() => handleNav('/settings')}> <FaCog style={{ marginRight: 8 }} /> Settings </Box>
        <Box sx={{ ...navStyle, fontWeight: 700, background: palette.navActiveBg }}> <FaPrint style={{ marginRight: 8 }} /> Print </Box>
        <Box sx={{ ...navStyle, color: palette.navDanger }} onClick={handleClearData}> <FaTrashAlt style={{ marginRight: 8 }} /> Clear My Data </Box>
      </Box>
    </Box>
  );
});

const Print = () => {
  const pieRef = useRef();
  const barRef = useRef();
  const lineRef = useRef();
  const summaryRef = useRef();
  const navigate = useNavigate();

  // Use Redux state for currency, budget, and transactions
  const currency = useSelector((state) => state.settings.currency) || 'USD';
  const budget = useSelector((state) => state.settings.monthlyBudget) || 0;
  const transactions = useSelector((state) => state.transactions.transactions) || [];

  // Memoized derived values
  const now = React.useMemo(() => new Date(), []);
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthTransactions = React.useMemo(() =>
    transactions.filter((txn) => {
      const date = new Date(txn.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }), [transactions, currentMonth, currentYear]
  );

  const totalIncome = React.useMemo(() =>
    currentMonthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0),
    [currentMonthTransactions]
  );

  const totalExpenses = React.useMemo(() =>
    currentMonthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0),
    [currentMonthTransactions]
  );

  const overBudget = React.useMemo(() => totalExpenses > budget, [totalExpenses, budget]);
  const overBudgetAmount = React.useMemo(() => (totalExpenses - budget).toFixed(2), [totalExpenses, budget]);
  const remainingBudget = React.useMemo(() => (budget - totalExpenses).toFixed(2), [totalExpenses, budget]);

  // Get the 3 most recent transactions (sorted by date descending)
  const recentTransactions = React.useMemo(() =>
    [...currentMonthTransactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3),
    [currentMonthTransactions]
  );

  const formatter = React.useCallback((value) => `${currency} ${Number(value).toFixed(2)}`, [currency]);

  // Memoized handlers
  const handleDownloadPDF = React.useCallback(async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    let y = 20;
    const today = dayjs().format('MMMM D, YYYY');

    const addImageSection = async (title, ref, height = 60) => {
      if (!ref.current) return;
      const canvas = await html2canvas(ref.current, { scale: 2 });
      const img = canvas.toDataURL('image/png');
      if (y + height > 260) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(title, 10, y);
      y += 6;
      doc.setLineWidth(0.3);
      doc.line(10, y, 200, y);
      y += 4;
      doc.addImage(img, 'PNG', 10, y, 190, height);
      y += height + 8;
    };

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Financial Report', 10, y);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on ${today}`, 160, y);
    y += 12;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Summary of Current Month', 10, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(`Total Income: ${formatter(totalIncome)}`, 10, y);
    y += 6;
    doc.text(`Total Expenses: ${formatter(totalExpenses)}`, 10, y);
    y += 6;
    doc.text(`Budget: ${formatter(budget)}`, 10, y);
    y += 6;
    doc.setTextColor(overBudget ? 'red' : 'green');
    doc.text(
      overBudget
        ? `Over Budget by ${formatter(overBudgetAmount)}`
        : `Under Budget by ${formatter(remainingBudget)}`,
      10,
      y
    );
    doc.setTextColor('black');
    y += 10;

    await addImageSection('Expense by Category', pieRef);
    await addImageSection('Income vs Expense', barRef);
    await addImageSection('Monthly Expense Trends', lineRef, 75);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Recent Transactions', 10, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('Description', 10, y);
    doc.text('Amount', 180, y, { align: 'right' });
    y += 6;
    doc.setLineWidth(0.2);
    doc.line(10, y, 200, y);
    y += 4;

    if (recentTransactions.length === 0) {
      doc.text('No transactions yet.', 10, y);
      y += 8;
    } else {
      recentTransactions.forEach((t) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        const desc = t.description || t.category || '-';
        const sign = t.type === 'income' ? '+' : '-';
        const amt = `${sign}${formatter(t.amount)}`;
        doc.text(desc, 10, y);
        doc.text(amt, 190, y, { align: 'right' });
        y += 8;
      });
    }

    doc.save('financial-report.pdf');
  }, [pieRef, barRef, lineRef, totalIncome, totalExpenses, budget, overBudget, overBudgetAmount, remainingBudget, recentTransactions, formatter]);

  const handleNav = React.useCallback((route) => navigate(route), [navigate]);
  const handleClearData = React.useCallback(() => {
    if (window.confirm('Are you sure you want to clear all your data?')) {
      localStorage.clear();
      navigate('/');
      window.location.reload();
    }
  }, [navigate]);

  const palette = COLOR_PALETTE.light;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: palette.mainBg }}>
      <Sidebar handleNav={handleNav} handleClearData={handleClearData} />
      <Box sx={{ flex: 1, background: palette.mainBg, color: palette.mainColor, p: { xs: 1, sm: 2, md: 4 }, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, mt: 2, textAlign: 'center' }}>
          Print or Download Your Finance Charts
        </Typography>
        <Box sx={{ width: '100%', maxWidth: 750 }}>
          {/* Summary Bar (matches Dashboard.js) */}
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
            Total Income: {currency} {totalIncome.toFixed(2)} &nbsp; 
            Total Expense: {currency} {totalExpenses.toFixed(2)} &nbsp; 
            Budget: {currency} {budget.toFixed(2)} &nbsp; 
            {overBudget ? 'Over' : 'Under'} Budget: {currency} {overBudget ? overBudgetAmount : remainingBudget}
          </Box>
          <Paper sx={{ p: 2, mb: 3 }}>
            <div ref={pieRef} style={{ display: 'flex', justifyContent: 'center' }}>
              <ExpensePieChart width={380} height={180} />
            </div>
          </Paper>
          <Paper sx={{ p: 2, mb: 3 }}>
            <div ref={barRef} style={{ display: 'flex', justifyContent: 'center' }}>
              <IncomeBarChart width={380} height={180} />
            </div>
          </Paper>
          <Paper sx={{ p: 2, mb: 3 }}>
            <div ref={lineRef} style={{ display: 'flex', justifyContent: 'center' }}>
              <ExpenseLineChart width={600} height={220} />
            </div>
          </Paper>
          {/* Recent Transactions (matches Dashboard.js) */}
          <Paper sx={{ p: 2, mb: 3 }}>
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
          <Button variant="contained" color="primary" onClick={handleDownloadPDF}>Download as PDF</Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Print;
